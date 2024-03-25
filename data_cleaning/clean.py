import pandas as pd
import random

# import data and set index and remove date column
FOLDER = "data_cleaning"
df = pd.read_csv(f"{FOLDER}/raw.csv")
df.index= pd.to_datetime(df["Date"])

# generate daily dates from start to end
start = df.index[0].date()
end = df.index[len(df)-1].date()
new_dates = pd.date_range(start=start,end=end,freq='D')

# reindex
df = df.reindex(new_dates)
df = df.rename_axis('Date')
 
# null weights
nul_data = pd.isnull(df['Weight'])

# add column called interpolated
df["Interpolated"] = False
df["Interpolated"][nul_data] = True

# linear interpolation
df['Weight_linear']= df['Weight'].interpolate(option='linear')
df["Weight_new"] = df["Weight_linear"]

# Add randomness to the interpolated data
for index, row in df.iterrows():
    if (row["Interpolated"]):
        # induce a random error normally distributed
        # and round values to one digit
        weight = row["Weight_linear"]
        error = random.normalvariate(0, 0.2)
        new_weight = round(weight + error, 1)

        df.at[index, "Weight_new"] = new_weight

df["Weight"] = df["Weight_new"]
df.drop(columns=["Date", "Weight_linear", "Weight_new", "Interpolated"], inplace=True)

# save cleaned and filled data
df.to_csv(f"{FOLDER}/cleaned.csv")

# plot
# plt.rcParams['figure.figsize']=(15,7)
# plt.plot(df['Weight_new'], color='blue')
# plt.title('Linear Interpolation')
# plt.show()

import pandas as pd
import random


DATE = "Date"
WEIGHT = "Weight"
INTERPOLATED = "Interpolated"
WEIGHT_LINEAR = "Weight_linear"
WEIGHT_NEW = "Weight_new"


# records:
# [
#     ["2022-08-13","108.0"],
#     ["2022-08-14","107.5"]
# ]
def interpolate_data(records):
    # import data and set index and remove date column
    headers = [DATE, WEIGHT]
    df = pd.DataFrame(records, columns=headers)
    df.index= pd.to_datetime(df[DATE])
    df[WEIGHT] = df[WEIGHT].astype(float)

    # generate daily dates from start to end
    start = df.index[0].date()
    end = df.index[len(df)-1].date()
    new_dates = pd.date_range(start=start,end=end,freq="D")

    # reindex
    df = df.reindex(new_dates)
    df = df.rename_axis(DATE)
    
    # null weights
    nul_data = pd.isnull(df[WEIGHT])

    # add column called interpolated
    df[INTERPOLATED] = False
    df[INTERPOLATED][nul_data] = True

    # linear interpolation
    df[WEIGHT_LINEAR]= df[WEIGHT].interpolate(option="linear")
    df[WEIGHT_LINEAR] = df[WEIGHT_LINEAR]

    # Add randomness to the interpolated data
    for index, row in df.iterrows():
        if (row[INTERPOLATED]):
            # induce a random error normally distributed
            # and round values to one digit
            weight = row[WEIGHT_LINEAR]
            error = random.normalvariate(0, 0.2)
            new_weight = round(weight + error, 1)

            df.at[index, WEIGHT_LINEAR] = new_weight

    df[WEIGHT] = df[WEIGHT_LINEAR]
    df.drop(columns=[DATE, WEIGHT_LINEAR, WEIGHT_LINEAR, INTERPOLATED], inplace=True)

    return df

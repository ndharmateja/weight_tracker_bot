from clean import interpolate_data
from to_json import convert_csv_to_json
from json import dumps
import os
import matplotlib.pyplot as plt

# takes in a list of csv records 
# records:
# [
#     ["2022-08-13","108.0"],
#     ["2022-08-15","107.5"]
# ] 
#
# returns: 
# {
#     "settings": [
#         {
#             "key": "goal",
#             "valueFloat": 85
#         }
#     ],
#     "version": 0,
#     "weights": [
#         {
#             "date": 1660348800000,
#             "weight": 108.0
#         },
#         {
#             "date": 1660435200000,
#             "weight": 107.5
#         },
#         {
#             "date": 1660521600000,
#             "weight": 107.3
#         }
#     ]
# }
def process(records):
    # interpolate data
    df = interpolate_data(records)

    # save interpolated data
    csv_filepath = "./cleaned.csv"
    df.to_csv(csv_filepath)

    # plot data and save to file
    plt.rcParams["figure.figsize"]=(15,7)
    plt.plot(df["Weight"], color="blue")
    plt.title("Weight vs Time")
    plt.savefig("chart.png")

    # convert csv data to json
    json_data = convert_csv_to_json(csv_filepath)

    # delete csv file
    os.remove(csv_filepath)

    return json_data


if __name__== "__main__":
    records = []
    with open("raw.csv") as f:
        for line in f:
            records.append(line.split(","))
    json_data = process(records[1:])
    print(dumps(json_data, indent=4))
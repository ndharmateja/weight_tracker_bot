import json
import pandas as pd


def convert_csv_to_json(csv_filepath):
    # create a json in the format that "Simple Weight Tracker" app requires
    data = {"settings": [{"key": "goal", "valueFloat": 85}], "version": 0, "weights": []}

    # go through csv and add weights to data
    df = pd.read_csv(csv_filepath)
    df.index= pd.to_datetime(df["Date"]).astype(int) / 10**6
    df.drop(columns=["Date"], inplace=True)
    for index, row in df.iterrows():
        timestamp = int(index)
        weight = row["Weight"]
        data["weights"].append({"date": timestamp, "weight": weight})

    return data


if __name__ == "__main__":
    # folder
    FOLDER = "."   

    # convert 
    csv_filepath = f"{FOLDER}/cleaned.csv"
    json_filepath = f"{FOLDER}/out.json"
    convert_csv_to_json(csv_filepath, json_filepath)
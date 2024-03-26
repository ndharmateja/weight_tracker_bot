import matplotlib.pyplot as plt


def plot_data(df, img_filename):
    # plot data and save to file
    plt.rcParams["figure.figsize"]=(15,7)
    plt.plot(df["Weight"], color="blue")
    plt.title("Weight vs Time")
    plt.grid()
    plt.yticks(range(84, 110, 2))
    plt.tick_params(labelleft=True, labelbottom=True, labelright=True)
    plt.savefig(img_filename)
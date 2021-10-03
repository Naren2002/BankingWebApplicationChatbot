import nltk
from nltk.stem.lancaster import LancasterStemmer
import numpy as np
from tensorflow.keras.models import load_model
import random
import json
import sys
import pickle

stemmer = LancasterStemmer()

with open("intents.json") as file:
    data = json.load(file)

model = load_model('modelClass.h5')

def bag_of_words(s, argsFile):

    with open(argsFile, "rb") as f:
        words, labels, training, output = pickle.load(f)

    bag = [0 for _ in range(len(words))]
    s_words = nltk.word_tokenize(s)
    s_words = [stemmer.stem(word.lower()) for word in s_words]

    for se in s_words:
        for i, w in enumerate(words):
            if w == se:
                bag[i] = (1)
    return(np.array(bag), labels)

def chat():
    inp = sys.argv[1]
    bow, labels1 = bag_of_words(inp, "data.pickle")
    # print(bow)
    # print(bow.shape)
    results = model.predict(bow.reshape(1, len(bow)))
    results_index = np.argmax(results)
    tag = labels1[results_index]

    for tg in data["intents"]:
        if tg["tag"] == tag:
            responses = tg["responses"]

    print("Before if statement: ", responses)
    if(responses[0] == "loanModel"):
        loanModel = load_model("modelLoan.h5")

        bow, labels2 = bag_of_words(inp, "data.pickle.loan")
        results = loanModel.predict(bow.reshape(1, len(bow)))
        results_index = np.argmax(results)

        tag = labels2[results_index]
        with open("loanIntents.json") as file:
            loanData = json.load(file)
        for tg in loanData["intents"]:
            if tg["tag"] == tag:
                responses = tg["responses"]
        print(random.choice(responses))

    else:
        print(random.choice(responses))

chat()

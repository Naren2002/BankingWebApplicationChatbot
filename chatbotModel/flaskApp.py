from flask import Flask
from flask import request
import nltk
from nltk.stem.lancaster import LancasterStemmer
from nltk.corpus import stopwords
import numpy as np
from tensorflow.keras.models import load_model
import random
import json
import sys
import pickle
from spellchecker import SpellChecker
import string

app = Flask(__name__)

stemmer = LancasterStemmer()

with open("intents.json") as file:
    data = json.load(file)

model = load_model('modelClass.h5')
homeLoanModel = load_model("modelHomeLoan.h5")
personalLoanModel = load_model("modelPersonal.h5")
businessLoanModel = load_model("modelBuisness.h5")
indianLoanModel = load_model("modelIndianEducation.h5")
foreignLoanModel = load_model("modelForeignEducation.h5")

def bag_of_words(s, argsFile):

    with open(argsFile, "rb") as f:
        words, labels, training, output= pickle.load(f)

    bag = [0 for _ in range(len(words))]
    s_words = nltk.word_tokenize(s)
    s_words = [stemmer.stem(word.lower()) for word in s_words]

    for se in s_words:
        for i, w in enumerate(words):
            if w == se:
                bag[i] = (1)
    return(np.array(bag), labels)


def spelling(text):
    spell = SpellChecker()
    splits = text.split()
    for split in splits:
        text=text.replace(split,spell.correction(split))

    return (text)

def rem_special(text):
    punc_removed = [x for x in text if x not in string.punctuation]
    punc_removed = "".join(punc_removed)

    punc_removed = [x for x in punc_removed.split() if x.lower() not in  stopwords.words('english')]
    punc_removed = " ".join(punc_removed)
    return (punc_removed)


@app.route('/', methods = ['POST'])
def running():

    def chat():
        inp = request.form['msg']
        inp = rem_special(inp)
        inp = spelling(inp)
        bow, labels1 = bag_of_words(inp, "data.pickle")
        # print(bow)
        # print(bow.shape)
        results = model.predict(bow.reshape(1, len(bow)))
        results_index = np.argmax(results)
        tag = labels1[results_index]

        for tg in data["intents"]:
            if tg["tag"] == tag:
                responses = tg["responses"]

        #print("Before if statement: ", responses)
        if(responses[0] == "home loan"):

            bow, labels2 = bag_of_words(inp, "data.pickle.homeloan")

            results = homeLoanModel.predict(bow.reshape(1, len(bow)))
            results_index = np.argmax(results)

            tag = labels2[results_index]

            with open("Homeloan.json") as file:
                loanData = json.load(file)
            for tg in loanData["intents"]:
                if tg["tag"] == tag:
                    responses = tg["responses"]
            return(random.choice(responses))


        elif(responses[0] == "personal loan"):


            bow, labels2 = bag_of_words(inp, "data.pickle.personalloan")

            results = personalLoanModel.predict(bow.reshape(1, len(bow)))
            results_index = np.argmax(results)

            tag = labels2[results_index]

            with open("PersonalLoan.json") as file:
                loanData = json.load(file)
            for tg in loanData["intents"]:
                if tg["tag"] == tag:
                    responses = tg["responses"]
            return(random.choice(responses))


        elif(responses[0] == "buisness growth loan"):


            bow, labels2 = bag_of_words(inp, "data.pickle.buisnessgrowthloan")

            results = businessLoanModel.predict(bow.reshape(1, len(bow)))
            results_index = np.argmax(results)

            tag = labels2[results_index]

            with open("BuisnessGrowthLoan.json") as file:
                loanData = json.load(file)
            for tg in loanData["intents"]:
                if tg["tag"] == tag:
                    responses = tg["responses"]
            return(random.choice(responses))


        elif(responses[0] == "indian education loan"):
            bow, labels2 = bag_of_words(inp, "data.pickle.indianeducationloan")

            results = indianLoanModel.predict(bow.reshape(1, len(bow)))
            results_index = np.argmax(results)

            tag = labels2[results_index]

            with open("IndianEducationLoan.json") as file:
                loanData = json.load(file)
            for tg in loanData["intents"]:
                if tg["tag"] == tag:
                    responses = tg["responses"]
            return(random.choice(responses))


        elif(responses[0] == "foreign education loan"):


            bow, labels2 = bag_of_words(inp, "data.pickle.foreigneducationloan")

            results = foreignLoanModel.predict(bow.reshape(1, len(bow)))
            results_index = np.argmax(results)

            tag = labels2[results_index]

            with open("ForeignEducationLoan.json") as file:
                loanData = json.load(file)
            for tg in loanData["intents"]:
                if tg["tag"] == tag:
                    responses = tg["responses"]
            return(random.choice(responses))

        else:
            return(random.choice(responses))

    reply = chat()
    print("reply: " + reply)
    return(reply)

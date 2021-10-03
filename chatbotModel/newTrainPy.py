import nltk
from nltk.stem.lancaster import LancasterStemmer
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Activation, Dropout
from tensorflow.keras.optimizers import SGD
import random
import json
import sys
import pickle

stemmer = LancasterStemmer()

jsonFiles = ["intents.json", "HomeLoan.json", "PersonalLoan.json","BuisnessGrowthLoan.json","IndianEducationLoan.json","ForeignEducationLoan.json"]
pickleFiles = ["data.pickle", "data.pickle.homeloan","data.pickle.personalloan","data.pickle.buisnessgrowthloan","data.pickle.indianeducationloan","data.pickle.foreigneducationloan"]
models = ["modelClass", "modelHomeLoan", "modelPersonal", "modelBuisness", "modelIndianEducation", "modelForeignEducation"  ]

for i in range(0, len(jsonFiles)):

    with open(jsonFiles[i]) as file:
        data = json.load(file)

    # print("This works just fine dont worry")
    try:
        #If you add something in the intents.json file then deliberately create an error here
        xmm
        with open(pickleFiles[i], "rb") as f:
            words, labels, training, output = pickle.load(f)
    except:
        words = []
        labels = []
        docs_x = []
        docs_y = []

        for intent in data["intents"]:
            for pattern in intent["patterns"]:
                wrds = nltk.word_tokenize(pattern)
                words.extend(wrds)
                docs_x.append(wrds)
                docs_y.append(intent["tag"])

            if(intent["tag"] not in labels):
                labels.append(intent["tag"])


        words = [stemmer.stem(w.lower()) for w in words]
        words = sorted(list(set(words)))

        labels = sorted(labels)

        training = []
        output = []

        out_empty = [0 for _ in range(len(labels))]

        for x, doc in enumerate(docs_x):
            bag = []
            wrds = [stemmer.stem(w) for w in doc if w != "?"]

            #One hot encoding or something similar sounding
            for w in words:
                if(w in wrds):
                    bag.append(1)
                else:
                    bag.append(0)

            output_row = out_empty[:]
            output_row[labels.index(docs_y[x])] = 1

            training.append(bag)
            output.append(output_row)

        training = np.array(training)
        output = np.array(output)

        with open(pickleFiles[i], "wb") as f:
            pickle.dump((words, labels, training, output), f)


    model = Sequential()
    model.add(Dense(128,
                    input_shape=(len(training[0]),),
                    activation='relu'))

    model.add(Dropout(0.5))
    model.add(Dense(64, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(len(output[0]), activation='softmax'))



    sgd = SGD(lr = 0.01, decay=1e-6, momentum=0.9, nesterov=True)
    model.compile(loss='categorical_crossentropy', optimizer = sgd, metrics=['accuracy'])

    model.fit(training, output, epochs=300, batch_size=8)
    model.save(models[i] + ".h5")

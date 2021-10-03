import nltk
from nltk.stem.lancaster import LancasterStemmer
import numpy as np
import tensorflow as tf
import random
import json
import sys
import pickle

stemmer = LancasterStemmer()

with open("intentsInside.json") as file:
    data = json.load(file)

with open("inside.pickle", "rb") as f:
    words, labels, training, output = pickle.load(f)

model = tf.keras.models.load_model('modelClassInside.h5')
print(model.summary())

def bag_of_words(s, words):
    bag = [0 for _ in range(len(words))]
    s_words = nltk.word_tokenize(s)
    s_words = [stemmer.stem(word.lower()) for word in s_words]

    for se in s_words:
        for i, w in enumerate(words):
            if w == se:
                bag[i] = (1)
    return(np.array(bag))

def chat():
    print("Start talking with the bot!")
    inp = sys.argv[1]
    bow = bag_of_words(inp, words)
    print(bow)
    print(bow.shape)
    results = model.predict(bow.reshape(1, len(bow)))
    results_index = np.argmax(results)
    tag = labels[results_index]

    for tg in data["intents"]:
        if tg["tag"] == tag:
            responses = tg["responses"]

    print(random.choice(responses))

chat()

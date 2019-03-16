import os, json
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

def preprocess(s, case = "L"):
    if case == "L":
        s = s.lower()
    elif case == "U":
        s = s.upper()
    return s

def tokenize(s, tokenize_char=None):
    punctuations = "-,.?!;: \n\t"
    s = [t.strip(punctuations) for t in s.split(tokenize_char)]
    s = [t for t in s if t != '']
    return s

def get_full_text(file_path):
    # get text from .txt
    file = open(file_path, "r")
    file_text = file.read()
    text_l = [text for text in file_text.split('\n') if text]
    return text_l

def get_stories(start, titles, text_l):
    t = 0
    title_text = [""]*len(titles)
    # get story associated with title
    for i in range(start, len(text_l)):
        title = titles[t]
        if text_l[i] == "OYEZ-OYEZ-OYEZ":
            break
        if not t == len(titles)-1:
            if text_l[i] == titles[t+1]:
                t += 1
                continue
        title_text[t] += " " + text_l[i]
    return title_text

file_path = "/Users/davidhuang/Documents/CSE457A/Assignments/DavidHuang_a3/englishfairytales/englishfairytales.txt"
text_l = get_full_text(file_path)

titles = []
i_start = text_l.index("CONTENTS")
i_toc_end = 0

# get list of titles
for i in range(i_start, len(text_l)):
    if text_l[i+3] == "OYEZ-OYEZ-OYEZ":
        i_toc_end = i+5
        break
    titles.append(text_l[i+3])

documents = [story.lstrip() for story in get_stories(i_toc_end+1, titles, text_l)]

stop_list = ["a", "about", "above",
    "all", "also", "am", "an", "and", "are", "as",
    "at", "the", "for", "be", "by", "of", "his", "her", "she", "him", "he",
    "does", "do", "have", "has", "it", "its", "to", "too"]

# https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html
# .fit_transform(documents) tokenizes the text
# tfidf will be a matrix of # of stories-by-# of tokens among stories
vectorizer = TfidfVectorizer(stop_words=stop_list)
bow = vectorizer.fit_transform(documents)
# document term matrix
dtf = bow.todense().A
tokens = vectorizer.get_feature_names()

# https://docs.scipy.org/doc/numpy-1.13.0/reference/generated/numpy.matrix.html
# calculate cosine similarity by using numpy dot product
# * = dot product in numpy
similarity_matrix = np.dot(bow, bow.T).A

num_stories = similarity_matrix.shape[0]
num_tokens = dtf.shape[1]
# titles.sort()
final_data = {
    "correlations": {}
}
for i, title in enumerate(titles):
    final_data["correlations"][title] = []
    cos_sim = similarity_matrix[i]
    data = {
        "text": documents[i],
        "top_5": []
    }
    for j in range(num_stories):
        story_tfidfs = dtf[i]
        data[titles[j]] = {
            "cos_sim": cos_sim[j],
            "words_shared": len(set(documents[i].split()).intersection(documents[j].split()))
        }
    top_5_tfidf = sorted(range(num_tokens), key=lambda k: story_tfidfs[k], reverse=True)[:5]
    for w in top_5_tfidf:
        data["top_5"].append( {"word": tokens[w], "tfidf": story_tfidfs[w]} )
        # data["top_5"][tokens[w]] = story_tfidfs[w]
    final_data["correlations"][title].append(data)

titles.sort()
final_data["titles"] = titles

if not os.path.exists("/Users/davidhuang/Documents/CSE457A/Assignments/DavidHuang_a3/data/data.json"):
    print("writing to data.json")
    with open('data/data.json', 'w') as outfile:
        json.dump(final_data, outfile)

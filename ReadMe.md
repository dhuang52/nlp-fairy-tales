# nlp-fairy-tales

## Brief Overview
The objective of this project is to understand how similar English fairy tales are with
one another. So, I constructed an interactive correlation matrix made up of fairy tales.

The project is built using D3.

## Data/Processing
Using a corpus of English fairy tales, I processed the text data using sklearn and numpy
to find the cosine similarity between each fairy tale. I also used a document-term matrix
to find the 5 most important words associated with each story based off tf-idf scores.

The objective of the project is to visualize similarity and maybe give some shallow
insight into why some fairy tales might be more related than the others, so these
features from the data were chosen.

### Citations
External resources I used.
https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html
https://docs.scipy.org/doc/numpy-1.13.0/reference/generated/numpy.matrix.html
https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218

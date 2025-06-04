# # train_recommender.py
# import pandas as pd
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity
# import json
# import joblib

# # Load data
# jobs = pd.read_json('jobs.json')
# profiles = pd.read_json('profiles.json')

# # Example: create a text field for jobs and profiles
# jobs['text'] = jobs['jobTitle'] + ' ' + jobs['jobType'] + ' ' + jobs['location'] + ' ' + jobs['skillsRequired'].apply(lambda x: ' '.join(x))
# profiles['text'] = profiles['jobTitle'] + ' ' + profiles['location'] + ' ' + profiles['skills'].apply(lambda x: ' '.join(x))

# # Fit vectorizer on all text
# vectorizer = TfidfVectorizer()
# job_vecs = vectorizer.fit_transform(jobs['text'])
# profile_vecs = vectorizer.transform(profiles['text'])

# # For each profile, find top N jobs
# recommendations = {}
# for idx, profile_row in profiles.iterrows():
#     sims = cosine_similarity(profile_vecs[idx], job_vecs).flatten()
#     top_indices = sims.argsort()[-10:][::-1]
#     recommendations[profile_row['id']] = jobs.iloc[top_indices]['id'].tolist()

# # Save recommendations or expose as a service
# with open('recommendations.json', 'w') as f:
#     json.dump(recommendations, f)


# # Save vectorizer, job vectors, and job IDs for use in the Flask API
# joblib.dump(vectorizer, 'vectorizer.pkl')
# joblib.dump(job_vecs, 'job_vecs.pkl')
# joblib.dump(jobs['id'].tolist(), 'job_ids.pkl')


import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import joblib

# Load data
jobs = pd.read_json('jobs.json')
profiles = pd.read_json('profiles.json')

# Extract title from first experience in profiles
def extract_profile_title(experiences):
    if isinstance(experiences, list) and experiences:
        return experiences[0].get('title', '')
    return ''

profiles['title'] = profiles['experiences'].apply(extract_profile_title)

# # Create text fields for jobs and profiles
# jobs['text'] = jobs['jobTitle'] + ' ' + jobs['jobType'] + ' ' + jobs['location'] + ' ' + jobs['skillsRequired'].apply(lambda x: ' '.join(x))
# profiles['text'] = profiles['title'] + ' ' + profiles['skills'].apply(lambda x: ' '.join(x))

jobs['text'] = (
    jobs['jobTitle'] + ' ' +
    jobs['jobType'] + ' ' +
    jobs['location'] + ' ' +
    jobs['skillsRequired'].apply(lambda x: ' '.join(x)) + ' ' +
    jobs['about']
)

profiles['text'] = (
    profiles['title'] + ' ' +
    profiles['skills'].apply(lambda x: ' '.join(x)) + ' ' +
    profiles['about']
)

jobs['about'] = jobs['about'].fillna('')
profiles['about'] = profiles['about'].fillna('')

# Fit vectorizer on all text
vectorizer = TfidfVectorizer()
job_vecs = vectorizer.fit_transform(jobs['text'])
profile_vecs = vectorizer.transform(profiles['text'])

# For each profile, find top N jobs
# recommendations = {}
# for idx, profile_row in profiles.iterrows():
#     sims = cosine_similarity(profile_vecs[idx], job_vecs).flatten()
#     top_indices = sims.argsort()[-10:][::-1]
#     recommendations[profile_row['_id']] = [jobs.iloc[i]['_id'] for i in top_indices]

def extract_id(id_field):
    if isinstance(id_field, dict):
        return list(id_field.values())[0]
    return id_field

# For each profile, find top N jobs
# For each profile, find top N jobs
recommendations = {}
for idx, profile_row in profiles.iterrows():
    sims = cosine_similarity(profile_vecs[idx], job_vecs).flatten()
    top_indices = sims.argsort()[-10:][::-1]
    profile_id = int(extract_id(profile_row['_id']))
    job_ids_list = [int(extract_id(jobs.iloc[i]['_id'])) for i in top_indices]
    recommendations[profile_id] = job_ids_list

# Save recommendations or expose as a service
with open('recommendations.json', 'w') as f:
    json.dump(recommendations, f)

# Save vectorizer, job vectors, and job IDs for use in the Flask API
joblib.dump(vectorizer, 'vectorizer.pkl')
joblib.dump(job_vecs, 'job_vecs.pkl')
joblib.dump(jobs['_id'].tolist(), 'job_ids.pkl')
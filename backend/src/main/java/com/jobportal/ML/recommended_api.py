# recommend_api.py
from flask import Flask, request, jsonify
import joblib
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# Load your trained model/vectorizer/data here
# Load vectorizer, job vectors, and job IDs
vectorizer = joblib.load('vectorizer.pkl')
job_vecs = joblib.load('job_vecs.pkl')
job_ids = joblib.load('job_ids.pkl')

# @app.route('/recommend', methods=['POST'])
# def recommend():
#     profile = request.json
#     # Compute recommendations using your model
#     # Return top N job IDs
#     return jsonify({'job_ids': [1,2,3]})

# if __name__ == '__main__':
#     app.run(port=5001)

# @app.route('/recommend', methods=['POST'])
# def recommend():
#     profile = request.json
#     # Combine profile fields into a single string
#     profile_text = f"{profile.get('jobTitle', '')} {profile.get('location', '')} {' '.join(profile.get('skills', []))}"
#     profile_vec = vectorizer.transform([profile_text])
#     sims = cosine_similarity(profile_vec, job_vecs).flatten()
#     top_indices = sims.argsort()[-10:][::-1]
#     recommended_job_ids = [job_ids[i] for i in top_indices]
#     return jsonify({'job_ids': recommended_job_ids})

@app.route('/recommend', methods=['POST'])
def recommend():
    profile = request.json
    # Extract title from first experience
    title = ""
    experiences = profile.get('experiences', [])
    if isinstance(experiences, list) and experiences:
        title = experiences[0].get('title', '')
    about = profile.get('about', '')
    # Combine title, skills, and about for the profile text
    profile_text = f"{title} {' '.join(profile.get('skills', []))} {about}"
    profile_vec = vectorizer.transform([profile_text])
    sims = cosine_similarity(profile_vec, job_vecs).flatten()
    top_indices = sims.argsort()[-10:][::-1]
    recommended_job_ids = [job_ids[i] for i in top_indices]
    return jsonify({'job_ids': recommended_job_ids})

if __name__ == '__main__':
    app.run(port=5001)
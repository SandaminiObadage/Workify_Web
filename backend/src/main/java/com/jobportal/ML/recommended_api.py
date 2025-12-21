# # recommend_api.py
# from flask import Flask, request, jsonify
# import joblib
# from sklearn.metrics.pairwise import cosine_similarity

# app = Flask(__name__)

# # Load your trained model/vectorizer/data here
# # Load vectorizer, job vectors, and job IDs
# vectorizer = joblib.load('vectorizer.pkl')
# job_vecs = joblib.load('job_vecs.pkl')
# job_ids = joblib.load('job_ids.pkl')

# # @app.route('/recommend', methods=['POST'])
# # def recommend():
# #     profile = request.json
# #     # Compute recommendations using your model
# #     # Return top N job IDs
# #     return jsonify({'job_ids': [1,2,3]})

# # if __name__ == '__main__':
# #     app.run(port=5001)

# # @app.route('/recommend', methods=['POST'])
# # def recommend():
# #     profile = request.json
# #     # Combine profile fields into a single string
# #     profile_text = f"{profile.get('jobTitle', '')} {profile.get('location', '')} {' '.join(profile.get('skills', []))}"
# #     profile_vec = vectorizer.transform([profile_text])
# #     sims = cosine_similarity(profile_vec, job_vecs).flatten()
# #     top_indices = sims.argsort()[-10:][::-1]
# #     recommended_job_ids = [job_ids[i] for i in top_indices]
# #     return jsonify({'job_ids': recommended_job_ids})

# @app.route('/recommend', methods=['POST'])
# def recommend():
#     profile = request.json
#     # Extract title from first experience
#     title = ""
#     experiences = profile.get('experiences', [])
#     if isinstance(experiences, list) and experiences:
#         title = experiences[0].get('title', '')
#     about = profile.get('about', '')
#     # Combine title, skills, and about for the profile text
#     profile_text = f"{title} {' '.join(profile.get('skills', []))} {about}"
#     profile_vec = vectorizer.transform([profile_text])
#     sims = cosine_similarity(profile_vec, job_vecs).flatten()
#     top_indices = sims.argsort()[-10:][::-1]
#     recommended_job_ids = [job_ids[i] for i in top_indices]
#     return jsonify({'job_ids': recommended_job_ids})

# if __name__ == '__main__':
#     app.run(port=5001)


from flask import Flask, request, jsonify
import joblib
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# Load your pre-trained vectorizer, job vectors, and job IDs
vectorizer = joblib.load('vectorizer.pkl')   # Should be your text vectorizer, e.g., TfidfVectorizer
job_vecs = joblib.load('job_vecs.pkl')       # Matrix of job vectors (e.g., TF-IDF vectors)
job_ids = joblib.load('job_ids.pkl')         # List of job IDs corresponding to job_vecs rows

@app.route('/recommend', methods=['POST'])
def recommend():
    profile = request.json

    # Extract title from first experience if present
    experiences = profile.get('experiences', [])
    title = experiences[0].get('title', '') if experiences else ''

    # --- Clean and flatten skills ---
    raw_skills = profile.get('skills', [])
    skills = []
    for s in raw_skills:
        if isinstance(s, str):
            skills.extend([x.strip() for x in s.replace('\n', ',').split(',') if x.strip()])

    profile_text = f"{title} {' '.join(skills)} {profile.get('about', '')}"
    
    # Vectorize the profile text
    profile_vec = vectorizer.transform([profile_text])
    
    # Compute cosine similarity between profile and all job vectors
    sims = cosine_similarity(profile_vec, job_vecs).flatten()

    print("Profile text:", profile_text)
    print("Top 10 similarity scores:", sorted(sims, reverse=True)[:10])

    # # Get top 10 most similar jobs
    # top_indices = sims.argsort()[-10:][::-1]
    # recommended_job_ids = [job_ids[i] for i in top_indices]
    
     # Only keep jobs with similarity > 0.2, then get top 10
    threshold = 0.2
    filtered_indices = [i for i in sims.argsort()[::-1] if sims[i] > threshold][:10]

     # --- Add this debug print ---
    for idx in filtered_indices:
        print(f"Job ID: {job_ids[idx]}, Similarity: {sims[idx]}")
    # ----------------------------

    recommended_job_ids = [job_ids[i] for i in filtered_indices]

    

    return jsonify({'job_ids': recommended_job_ids})

if __name__ == '__main__':
    app.run(port=5001)

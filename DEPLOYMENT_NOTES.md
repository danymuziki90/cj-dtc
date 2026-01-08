Deployment notes and features added:
- Certificate verification API: GET /api/certificates?code=CODE
- Admin: view certificates and LMS configuration at /admin
- LMS connection: store provider/apiUrl/apiKey in LMSConfig via seed or admin; use provider APIs to sync (stubs provided)
- To integrate Moodle: provide Moodle API URL and token in LMSConfig; implement sync script to push enrollments via Moodle REST API.
- To integrate TalentLMS: use TalentLMS API key similarly.
- For Google Classroom: OAuth client required (not included).

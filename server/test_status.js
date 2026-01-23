const axios = require('axios');
const { db } = require('./database');

const API_URL = 'http://localhost:3001/api';

async function runTest() {
    console.log("--- STARTING STATUS FUNCTIONALITY TEST ---");

    // 1. Authenticate to get token
    console.log("\n1. Authenticating...");
    let token;
    try {
        const authRes = await axios.post(`${API_URL}/login`, {
            username: 'admin@luxtech.io',
            password: 'admin123'
        });
        token = authRes.data.token;
        console.log("✅ Authenticated successfully.");
    } catch (e) {
        console.error("❌ Authentication failed:", e.message);
        return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Create a Draft Article
    console.log("\n2. Creating a Draft Article...");
    let articleId;
    try {
        const createRes = await axios.post(`${API_URL}/articles`, {
            title: 'Test Draft Article',
            content: '<p>This is a draft content.</p>',
            excerpt: 'Draft excerpt',
            category: 'ENGINEERING',
            readTime: '1 min',
            imageUrl: 'https://via.placeholder.com/150',
            status: 'draft'
        }, { headers });

        articleId = createRes.data.id;
        console.log(`✅ Draft created. ID: ${articleId}`);
    } catch (e) {
        console.error("❌ Failed to create draft:", e.response ? e.response.data : e.message);
        return;
    }

    // 3. Verify Status is 'draft'
    console.log("\n3. Verifying status is 'draft'...");
    try {
        const getRes = await axios.get(`${API_URL}/articles/${articleId}`);
        if (getRes.data.status === 'draft') {
            console.log("✅ Status verified as 'draft'.");
        } else {
            console.error(`❌ Expected 'draft', got '${getRes.data.status}'`);
        }
    } catch (e) {
        console.error("❌ Failed to fetch article:", e.message);
    }

    // 4. Update Article to 'published'
    console.log("\n4. Updating status to 'published'...");
    try {
        await axios.put(`${API_URL}/articles/${articleId}`, {
            title: 'Test Draft Article - Published',
            content: '<p>This is now published.</p>',
            excerpt: 'Published excerpt',
            category: 'ENGINEERING',
            readTime: '1 min',
            imageUrl: 'https://via.placeholder.com/150',
            status: 'published'
        }, { headers });
        console.log("✅ Article updated to published.");
    } catch (e) {
        console.error("❌ Failed to update status:", e.response ? e.response.data : e.message);
    }

    // 5. Verify Status is 'published'
    console.log("\n5. Verifying status is 'published'...");
    try {
        const getRes2 = await axios.get(`${API_URL}/articles/${articleId}`);
        if (getRes2.data.status === 'published') {
            console.log("✅ Status verified as 'published'.");
        } else {
            console.error(`❌ Expected 'published', got '${getRes2.data.status}'`);
        }
    } catch (e) {
        console.error("❌ Failed to fetch article:", e.message);
    }

    // Isolate Drafts from Public View?? 
    // Usually Frontend filters this, but let's check if API returns it in the list.
    // The requirement didn't explicitly say API should filter drafts for public, but usually it should.
    // However, for Admin panel we NEED them in the list.
    // Since this is a simple app, likely the frontend filters or API returns all.
    // Let's check what the list returns.
    console.log("\n6. Checking article list...");
    try {
        const listRes = await axios.get(`${API_URL}/articles`);
        const found = listRes.data.find(a => a.id.toString() === articleId.toString());
        if (found) {
            console.log(`✅ Article found in list with status: ${found.status}`);
        } else {
            console.error("❌ Article not found in list.");
        }
    } catch (e) {
        console.error("❌ Failed to fetch list:", e.message);
    }

    // Cleanup
    console.log("\n7. Cleaning up (Deleting test article)...");
    try {
        await axios.delete(`${API_URL}/articles/${articleId}`, { headers });
        console.log("✅ Test article deleted.");
    } catch (e) {
        console.error("❌ Failed to delete article:", e.message);
    }

    console.log("\n--- TEST COMPLETE ---");
}

runTest();

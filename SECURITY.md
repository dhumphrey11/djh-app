# Security Note

⚠️ **IMPORTANT: Service Account Keys**

Firebase service account keys (like `*firebase-adminsdk*.json`) contain sensitive credentials and should NEVER be committed to version control.

## What was done:
- ✅ Removed `djh-app-3bdc2-firebase-adminsdk-fbsvc-7f236361c4.json` from Git history
- ✅ Added service account patterns to `.gitignore`
- ✅ File still exists locally for development use

## For deployment:
- Use environment variables or secure credential management
- For Firebase Functions: credentials are automatically available in the runtime
- For local development: keep the file locally but never commit it

## If you accidentally commit credentials again:
1. Remove from tracking: `git rm --cached <filename>`
2. Add to .gitignore
3. Rewrite history: Use git filter-branch or BFG Repo Cleaner
4. Force push: `git push --force-with-lease origin main`
5. **Important**: Regenerate the compromised credentials in Firebase Console
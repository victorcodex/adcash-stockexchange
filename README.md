# Setup
- Clone Repo
- Run npm install
- Ensure MySQL Server is running
- cd into cloned directory
- run DB_HOST=<[localhost]> DB_USER=<[root]> DB_PASS=<[root]> DB=<[stockexchange]> node setup.js
  + ### On Windows
  + set DB_HOST=<[localhost]>
  + set DB_USER=<[root]>
  + ...
  + node setup.js
- This would create and populate the necessary table
- run - run DB_HOST=<[localhost]> DB_USER=<[root]> DB_PASS=<[root]> DB=<[stockexchange]> PORT=<[3000]> node index.js
- server is running on default port 3000

# Browser
On your browser visit http://localhost:3000/US/IT/10 ( http://localhost:3000/:country/:department/:bid )

# Test
npm test

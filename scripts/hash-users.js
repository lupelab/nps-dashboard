const bcrypt = require('bcryptjs');

const users = [
  ['lupe', 'LUPE'],
  ['omd', 'OMD'],
  ['roger', 'ROGER'],
  ['phd', 'PHD'],
  ['brick', 'BRICK'],
  ['nasta', 'NASTA'],
  ['raw', 'RAW'],
  ['bpr', 'BPR'],
  ['amplify', 'AMPLIFY'],
  ['texo', 'TEXO', 'holding']
];

(async () => {
  const password = process.argv[2] || 'Cambiar123!';
  const result = [];
  for (const [username, agency, role = 'agency'] of users) {
    const passwordHash = await bcrypt.hash(password, 10);
    result.push({ username, agency, role, passwordHash });
  }
  console.log(JSON.stringify(result));
})();

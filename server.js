const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1rpj_D8j3Mh9GdO8Ri63Dx3yeILup6xgrb0NRNkYIBSg';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);

  // TODO(you): Finish onGet.
  const title = rows[0];
  const newObj = rows.slice(1).map(val => {
	  const empObj={};
	  title.forEach( (val2 , ind) => {
		  empObj[val2] = val[ind];
	  });
	  return empObj;
  });

  res.json( newObj );
}
app.get('/api', onGet);

async function onPost(req, res) {
  const messageBody = req.body;

  // TODO(you): Implement onPost.
  const result = await sheet.getRows();
  const rows = result.rows;
  const title = rows[0];
  const oldAry = [];
  Object.keys(messageBody).forEach( val3 => {
	const inInd = title.findIndex( val4 => val4.toLowerCase() === val3.toLowerCase());
	oldAry[inInd] = messageBody[val3];
  });
  await sheet.appendRow( oldAry );

  res.json( { response: 'success'}  );
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;

  // TODO(you): Implement onPatch.
  const result = await sheet.getRows();
  const rows = result.rows;
  const thisInd = rows[0].findIndex( val => val.toLowerCase() === column.toLowerCase() );
  if (thisInd > -1) {
	  const rightInd = rows.slice(1).findIndex( val2 => val2[thisInd].toLowerCase() === value.toLowerCase());
	  if ( rightInd > -1 ) {
		  const oldAry = rows[rightInd+1];
		  Object.keys(messageBody).forEach( val3 => {
			  const inInd = rows[0].findIndex( val4 => val4.toLowerCase() === val3.toLowerCase());
			  oldAry[inInd] = messageBody[val3];
		  });
		  await sheet.setRow( rightInd+1 , oldAry );
	  }
  } 
  res.json( { response: 'success'} );
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;

  // TODO(you): Implement onDelete.
  const result = await sheet.getRows();
  const rows = result.rows;
  const thisInd = rows[0].findIndex( val => val.toLowerCase() === column.toLowerCase() );
  if (thisInd > -1) {
	  const rightInd = rows.slice(1).findIndex( val2 => val2[thisInd].toLowerCase() === value.toLowerCase());
	  if ( rightInd > -1 ) await sheet.deleteRow( rightInd+1 );
  } 
  res.json( { response: 'success'} );
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});

let express = require('express')
let {open} = require('sqlite')
let sqlite3 = require('sqlite3')
let bcrypt = require('bcrypt')
let path = require('path')
let db_path = path.join(__dirname, 'userData.db')
let app = express()
app.use(express.json())
let db = null

let initializeDbAndUser = async () => {
  db = await open({
    filename: db_path,
    driver: sqlite3.Database,
  })
  app.listen(3000, () => {
    console.log('Sever is started running....')
  })
}
initializeDbAndUser()

app.post('/register', async (request, response) => {
  let {username, name, password, gender, location} = request.body

  let user = `select * from user where username='${username}';`
  let hashedPass = await bcrypt.hash(password, 10)
  let isUserExist = await db.get(user)

  if (isUserExist === undefined) {
    if (password.length < 5) {
      response.status = 400
      response.send('Password is too short')
    } else {
      let insertQue = `insert into user(username,name,password,gender,location)
      values(
        '${username}',
        '${name}',
        '${hashedPass}',
        '${gender}',
        '${location}'
      );`
      await db.run(insertQue)
      response.status = 200
      response.send('User created successfully')
    }
  } else {
    response.send('User already exists')
    response.status = 400
  }
})

// API - 2
app.post('/login', async (request, response) => {
  let {username, password} = request.body
  let user = `select * from user where username='${username}';`
  let isUserExist = await db.get(user)
  if (isUserExist === undefined) {
    response.status = 400
    response.send('Invalid user')
  } else {
    let enteredPassword = await bcrypt.compare(password, isUserExist.password)
    if (enteredPassword === false) {
      response.status = 400
      response.send('Invalid password')
    } else {
      response.status = 200
      response.send('Login success!')
    }
  }
})

// API - 3

app.put('/change-password', async (request, response) => {
  let {username, oldPassword, newPassword} = request.body
  let user = `select * from user where username='${username}';`
  let isUserExist = await db.get(user)

  let isPasswordMatched = await bcrypt.compare(
    oldPassword,
    isUserExist.password,
  )
  if (isPasswordMatched === false) {
    response.status(400)
    response.send('Invalid current password')
  } else {
    if (newPassword.length < 5) {
      response.status = 400
      response.send('Password is too short')
    } else {
      isUserExist.password = newPassword
      response.status = 200
      response.send('Password updated')
    }
  }
})

module.exports = app

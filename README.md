# NOrSe
This is the second rendition of the original chat client Novus Ordo Seclorum. Features of it include:
* Self-hostable chat server
* Built-in radio function using webamp
* A streamlined UI (definitely better than previous version?)
* Encrypted passwords and simple user creation system
* A theme changing system

## Requirements:
Node.js:
* `sudo apt-get install nodejs`
Express, Socket.io, and the postgresql packages:
* `npm install --save express socket.io pg`

## Downloading:
`git clone https://github.com/EPiC-Inc/NOrSe.git`

## Starting the Server
1). Create the file `users.json` if it does not yet already exist
2). Using node to run the `server.js` file provides the easiest method to start the server.
`node server.js [port]` (port is optional, it defaults to port 80)

## Updating:
`git pull origin master`

## To-Do:
* Create more efficient theme system
* Implement UI redesign
* Implement Webamp (https://github.com/captbaritone/webamp)
* Implement commands and 'song request' features to ytdl songs
* Possible 'Resistance' media server (:

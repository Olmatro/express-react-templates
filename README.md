# Express React Templates

This is a **very simple** way to create a ui with api bindings built in.

Opinions:
* React as templating language
* Express with sensible defaults and middleware for file uploads
* Next.js (and PHP) inspired "place a file in a directory and it just works"

## Usage

`yarn install`

`yarn start:watch`

Visit `localhost:3003` in your browser.

## Creating Routes

Just place a JS file in the `pages` directory. It'll automatically be picked up
on the server. The name of the file becomes the route, e.g. `src/pages/salsa.js`
is visible at `http://localhost:3003/salsa`.

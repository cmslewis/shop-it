# 'Shop It: A Simple Barbershop Harmonizer

Enter a sequence of pitches in C Major, then click "Harmonize" to see various barbershop chord progressions for that melody. Brought to you by recursive backtracking.

### Examples

- **Down Our Way**: `E B A G A E D`
- **Mary Had a Little Lamb**: `E D C D E E E`
- **Chromatic scale**: `C C# D D# E F F# G`
- **Santa Fe**: `G(G7) F E(C) G F E(Am7)`

### Notes

- **Forced chords.** You can force a particular chord for a particular melody note. Just put the chord name in parentheses after the pitch: F#(D7). Make sure the forced chord actually contains the pitch—you won't see any validation messages or error messages if not.
- **Progression permissivity.** You can decide whether to allow only basic Circle of Fifths motion (e.g. II7 → V7 → I) or additional progressions as well (e.g. I#7 → I7, tritone substitution). Permitting all progressions will give many more results.
- **Melody length.** For performance reasons, melodies can be at most 15 pitches long. Computating anything longer would likely cook your browser.
- **Letter casing.** Case matters only for chord names (e.g. because AM7 and Am7 are distinct chords). Case does not matter for pitch names.
- **Playing chords.** You can play through progressions using [Keyano](https://cmslewis.github.io/keyano), a browser-based piano, if you want.

## Development

### Deploying

To deploy to Github Pages, run the following:

```
yarn run deploy
```

Then go to https://cmslewis.github.io/shop-it.

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

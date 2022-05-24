# 💈 'Shop It: A Simple Barbershop Harmonizer

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

## How this works

While arranging barbershop music, I've often wished for a tool that could quickly show me all legal-ish chord progressions that are possible for a certain sequence of melody notes. This is a scrappy, two-day attempt at building such a tool.

This is a decidedly **rules-based** harmonization engine. That means that there is an explicit, curated list of rules dictating how each chord is allowed to progress. For instance, G7 may always go to C, while C can go anywhere, since it's the tonic. The rules are stitched together to build a graph of all possible chord progressions, then for a given melody, recursive backtracking is used to find all harmonic paths "out of the maze." This system isn't particularly robust&mdash;it's mostly just a quick proof of concept. But it does spit out some interesting results!

This is intentionally _not_ powered by a Machine Learning model. In the past, I built an ML model for harmonizing melodies using a [Hidden Markov Model](https://en.wikipedia.org/wiki/Hidden_Markov_model) trained on Bach chorales. That approach may yield a more statistically defensible result for any given melody, but it would have required more training data than I had time to create, and it also tends to give boring, least-common-denominator harmonizations. In contrast, the rules-based engine here just returns all reasonable-ish progressions for you to peruse. The result is a much greater appreciation for the complexities of barbershop arranging. :)

To learn more about barbershop, visit the Barbershop Harmony Society's [website](http://barbershop.org/). To learn more about the chorus I direct, visit the Fog City Singers' [website](https://www.fogcitysingers.com/).

## Deploying

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

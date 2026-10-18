# Secret Signals: Hints and Extension

Use these with the **independent challenge**: *"Help your detector recognize the signals in a position it struggled with."*
Open one hint at a time. Try first!

---

## 💡 Hint 1

**Look at your training examples, not your tests.**

Click through the samples in each class. Do any of them show your hand in the position that failed? If the computer never saw that position, it has nothing to match it with.

---

## 💡 Hint 2

**Teach the tricky position in every class, a little at a time.**

- Record **short bursts** (about 1 second) of each signal **in the position that failed**. Move your hand a bit between bursts.
- If you changed the background or distance, add **No signal** examples that match the change too.
- Keep the three classes **about the same size**.
- Click **Train Model** again, then rerun the **same** tests.

---

## 🌟 Optional extension: "Whose hands?"

Real space-station controls must work for every astronaut.

1. With permission, test your detector with a **partner's hand**. Don't add it to your training first. Record the results in a fresh copy of the test table.
2. If it struggles, add a small, balanced set of your partner's examples to each class (hands only), retrain, and test both hands again.
3. Write 2–3 sentences: *What does this show about where training data comes from? Who might a model like this work worse for, and how could a team check before using it for real?*

**Ask your teacher first.** Use the classroom-objects version if anyone isn't comfortable sharing their hands.

# Mission: Teach the Computer Your Secret Signals

**Space Station 207 needs a contact-free control panel.** Astronauts can't always touch buttons, so your team will train a computer to recognize two secret hand signals, and to notice when **no** signal is showing.

| Signal | Means |
| --- | --- |
| ✋ **Open hand** | "Open the airlock" |
| ✊ **Closed fist** | "Close the airlock" |
| ⬜ **No signal** | "Do nothing" |

**Your goal:** teach the computer, test it fairly, find where it gets confused, and make it better.

**Work with a partner.** One person makes signals, and the other runs the computer. Switch jobs halfway.

---

## Mission rules

- 📷 **Only hands and a plain background in the camera.** Tilt the screen or move back so your faces stay out of the picture. No faces, name tags, or anything with your name on it.
- 🚫 **Don't save, upload, or export.** Skip **Save project to Drive** and **Export Model**. When the mission ends, close the tab.
- 🎯 **A perfect score is not required.** Finding a mistake is part of the mission.

---

## Part 1: Build your detector

1. Go to **teachablemachine.withgoogle.com** and click **Get Started**. You don't need an account.
2. Choose **Image Project**, then **Standard image model**.
3. Rename the classes. Click the pencil next to **Class 1** and type `Open hand`. Rename **Class 2** to `Closed fist`.
4. Click **Add a class** and name it `No signal`.

## Part 2: Collect training examples (Round 1)

5. Under **Open hand**, click **Webcam**. If your browser asks, allow the camera.
6. Hold up an open hand in front of a plain background (a wall or a sheet of paper). Keep it **in one spot** for Round 1.
7. **Hold down Hold to Record** for about 1 second, then let go. Do that 2 times.
8. Do the same for **Closed fist**, in the same spot.
9. For **No signal**, record just the plain background with no hand.
10. Check the sample counts. Try to keep the three classes **about the same size**.

> 💡 **Why only 1 second?** The webcam grabs many pictures per second. Holding the button longer gives you lots of pictures that look almost the same. That's more pictures, but not more *variety*.

## Part 3: Train and predict

11. Click **Train Model**. Keep this tab open and in front while it trains.
12. **Before you test, predict.** Write it in your test table: *If I turn my hand sideways, what will the computer say?*

## Part 4: Test with NEW examples

13. Look at the **Preview** panel. Make sure **Input** is **ON** and set to **webcam**.
14. Show each signal **live**. These are new test examples: the computer never trained on them.
15. Watch the **Output** bars. Hold each signal still for about 3 seconds. Write down which class is highest most of the time, and about how full its bar is.
16. Fill in the **Round 1, normal position** rows of your test table.

> 🔍 **What the bars mean:** a bar is the model's *score* for each class. A high score is not a promise that the model is right, and it doesn't mean the computer *understands* hands. The model always picks from your three classes, even when you show it something new, like a thumbs-up.

## Part 5: Change one thing

17. Pick **one** change and test all three classes again:
    - 🔄 hand **angle** (turn it sideways)
    - 📏 **distance** (move closer or farther)
    - 🖼️ **background** (a different wall, desk, or color)
18. Fill in the **Round 1, changed condition** rows. Did something go wrong, or did the scores change?

## Part 6: Make it better (Round 2)

19. Add **new, varied examples** for every class, including the position that caused trouble. Move your hand a little between short recordings. Add **No signal** examples with the new background too.
20. Keep the classes about the same size again.
21. Click **Train Model** again.
22. Run **the same tests** as Round 1, normal and changed. Fill in the **Round 2** columns. What changed?

---

## 🚀 Independent challenge

**"Help your detector recognize the signals in a position it struggled with."**

Record your answers on the challenge card in the test table:

1. **What failed?** Which signal and which position?
2. **What examples did you add?** How many, and how were they different?
3. **What happened after retraining?**
4. **One limitation that's still there.** What could still fool it?

You don't need a perfect detector to finish. You need to show what you tried and what happened.

Stuck? See **05-hints-and-extension.md**.

---

## Wrap-up

23. Close the Teachable Machine tab. If you didn't save anything, Google's FAQ says nothing is kept in your browser or on any servers.
24. Talk with your partner: **What is the difference between a training example and a test example?**

---

## 🔭 Deeper reflection (grades 6–8)

Answer two or more in full sentences.

1. **Training vs. testing.** Your live hand was a test example. Why would testing only with the pictures you trained on be an unfair test?
2. **Variety vs. quantity.** Imagine Class A has 300 pictures from one long hold and Class B has 60 pictures from 12 different positions. Which teaches the model more? Explain.
3. **Under the hood.** Teachable Machine's *Under the hood* panel says it keeps about 15% of your samples aside as "test samples." If those came from the same few seconds of recording, why might its accuracy look better than your live tests?
4. **The "No signal" problem.** Show something that isn't one of your classes, like a thumbs-up or a pencil. What happens? Why can't the model say "I don't know"?
5. **Real stakes.** A real space station control would need to work for every astronaut. Whose hands, skin tones, sleeves, jewelry, or lighting might your training data be missing? How would you test for that?

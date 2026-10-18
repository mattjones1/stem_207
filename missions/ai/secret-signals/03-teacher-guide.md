# Teacher Guide: Teach the Computer Your Secret Signals

**Grades:** 2–8 · **Area:** Artificial Intelligence · **Format:** pairs
**Platform:** Google Teachable Machine, Image Project → <https://teachablemachine.withgoogle.com/>
**Teacher setup:** about 20 minutes, once · **Student activity:** about 45 minutes, one session

---

## Learning goal

Students will explain the difference between **training examples** and **new test examples**, and show how **changing the training data** changes the model's predictions.

**Students can show it by:**
- Filling in a before-and-after test table with the same tests in Round 1 and Round 2.
- Explaining in their own words why the live webcam hand counts as a *new* example.
- Finishing the challenge card: what failed, what they added, what happened, and one limitation that remains.

**Not required:** a perfect model. A detector that still makes mistakes, with good notes, completes the mission.

---

## Teacher setup (about 20 minutes, before class)

1. **Check the device and browser (10 min).** On a student device, open <https://teachablemachine.withgoogle.com/>, click **Get Started → Image Project → Standard image model**, click **Webcam** in **Class 1**, and allow the camera. Record a few samples, add a second class, and click **Train Model**. The official FAQ does not list supported browsers or devices, so test the exact model of Chromebook or laptop your students use. *(See "Check before class" below.)*
2. **Check camera permission.** If the camera is blocked, Teachable Machine shows: *"There was an error opening your webcam. Make sure permissions are enabled or switch to image uploading."* Fix permissions or plan the alternative below.
3. **Check policy.** Confirm that your school or district allows student webcam use in a browser tool. Teachable Machine links to Google's general Privacy & Terms page (<https://policies.google.com/>); it does not publish education-specific terms.
4. **Prepare backgrounds.** One sheet of plain paper or a plain wall per pair helps a lot.
5. **Print** `04-test-table.md` (one per pair), and the low-reading version for younger students.
6. **Optional:** queue a tutorial video from the official playlist (linked in the FAQ): <https://www.youtube.com/playlist?list=PLJfHZtseuscuTQfodmFnbZ3rBgCWsRT9t>

---

## Privacy and camera use: what to tell students

Confirmed in the official FAQ (<https://teachablemachine.withgoogle.com/faq>):

- **No account:** "No need to make an account or log in."
- **Samples stay local:** samples "aren't sent to any servers, unless you save your project to Google Drive," and training happens "in your browser tab without sending anything to any servers."
- **Closing the tab erases everything:** "If you close your tab and do none of the above, nothing is saved in your browser or on any servers."
- **Uploading publishes the model:** "upload my model" publishes the model to Google servers and creates a shareable link. The training samples are not published.

**Classroom rules for this mission**
- Frame **only hands and a plain background**. Tilt the screen down, sit back, or hold the hand close to the camera so faces stay out.
- No name tags, ID badges, or anything with names in view.
- **Don't use** *Save project to Drive*, *Download project as file*, *Download Samples*, or *Export Model*. **Never** use upload or publish.
- **Close the tab** when finished.

---

## Alternative: classroom objects (approve before class)

Use this if webcams aren't allowed, students aren't comfortable showing hands, or a student's hands are hard to frame.

**Option A: objects on the webcam (no hands).** Keep three classes with the same mission story:
- **Signal 1:** a red marker cap (or any small object)
- **Signal 2:** a blue block (or any different object)
- **No signal:** the empty background

Slide objects in with a ruler or place them by hand just out of frame. Everything else in the mission stays the same: angle, distance, and background changes still work.

**Option B: no student camera at all (upload).** Before class, take photos of the objects on a school device. Use objects only, no people. Students click **Upload** in each class and choose the photos. Teachable Machine crops uploads to a square from the center. For testing, set **Preview → Input** to **file** and upload test photos that weren't used for training. Keep a separate "test" folder of photos, including some at new angles and on new backgrounds, so the before-and-after comparison still works.

---

## Activity timing (about 45 minutes)

| Time | Step | Notes |
| --- | --- | --- |
| 0–5 | **Hook and mission** | Read the space-station mission aloud. Show the three classes. Model the rules: hands only, no saving. |
| 5–13 | **Collect Round 1** | Short bursts of **Hold to Record** (about 1 second each) in **one position**, with roughly balanced classes. |
| 13–17 | **Train and predict** | **Train Model**. Students write a prediction for a new hand position before testing. |
| 17–23 | **Test live** | Preview with **Input ON**. Test each class with new examples and fill in the Round 1 normal rows. |
| 23–27 | **Change one condition** | Angle, distance, *or* background. Test all three classes and record any mistake or score change. |
| 27–35 | **Add variety and retrain** | Add varied samples to every class, including No signal on the new background. Keep classes balanced. **Train Model** again. |
| 35–40 | **Retest and compare** | Run the same tests and fill in the Round 2 columns. |
| 40–45 | **Challenge card and share** | Pairs finish the four challenge questions. Run a quick share-out using the discussion questions. Close tabs. |

**Splitting into two sessions:** closing the tab erases the project. To continue another day, a student would have to save the project (to Drive or as a file), and that saves their hand images. If you must split, have students rebuild Round 1 quickly in session 2 rather than saving images, or use Option B with teacher-provided object photos.

---

## Key ideas to teach

**Training examples vs. test examples.** Training examples are the pictures in each class. The model learns from them. Test examples are new pictures it has never seen, like the live webcam image in Preview. A fair test uses new examples.

**Variety beats volume.** In the official tool, **Hold to Record** captures at 24 frames per second by default (Settings shows *FPS: 24*). Holding for 5 seconds adds about 120 nearly identical pictures. That's a lot of data with very little variety. Short bursts from different positions teach the model more.

**Balanced classes.** If one class has far more samples than another, the model can lean toward it. Have students check the sample counts.

**Scores are outputs, not guarantees.** The **Output** bars show the model's score for each class. A high score doesn't mean the answer is right, and it doesn't mean the computer "understands" hands. It found patterns in pixels that matched your examples. The model always chooses among its classes, so something brand new (a thumbs-up, a pencil) still gets labeled as one of them.

**For grades 6–8: under the hood.** Teachable Machine's **Under the hood** panel explains that it keeps about 15% of samples as "test samples" and trains on the other 85%. Those test samples come from the same recordings, so they can look very similar to the training samples. That's one reason live tests with new conditions matter.

---

## Common problems

| Problem | Try this |
| --- | --- |
| Camera won't start; error about permissions | Check the browser's camera permission for the site, close other apps using the camera, or switch to the **Upload** alternative. |
| Faces are in the frame | Tilt the screen down, hold the hand closer, or sit back. Use the paper background. |
| One class wins every time | Check sample counts. One class may have far more. Rebalance and retrain. |
| "No signal" shows up when a hand is visible | The No signal class may include a hand edge or arm. Remove those samples and record the empty background again. |
| Perfect in Round 1, then fails when the hand turns | That's the lesson! Add varied examples and retrain. |
| Scores jump around | Hold the signal still for 3 seconds and record the class that's highest most of the time. |
| Students added samples but nothing changed | They need to click **Train Model** again. |
| Training seems stuck or the page is slow | Keep the tab in front during training, close other tabs, and use fewer samples (short bursts). |
| A student clicked Save to Drive or Export | Stop before anything is uploaded. Delete the Drive file if one was created. Remind students the mission never needs saving. |
| The model is still wrong after retraining | That's fine. Write it down as the "limitation that remains." |

---

## Discussion questions

**All grades**
1. What's the difference between the pictures you **taught** it and the hands you **tested** it with?
2. Why did adding *different* pictures help more than adding *more of the same* picture?
3. The computer showed a high score but was wrong. What does that tell us about scores?

**Grades 4–8**
4. What happened when you showed something that wasn't a signal, like a thumbs-up? Why?
5. If you were building this for real astronauts, what would you test before trusting it?

**Grades 6–8**
6. Teachable Machine reported high accuracy, but live tests failed in a new position. How can both be true?
7. Whose hands might this model work worse for if only your team trained it? How would you check?
8. Where else do computers use cameras to recognize gestures or objects? What could go wrong?

---

## Common misconceptions

- **"More pictures always means better."** Variety and balance matter more than raw count.
- **"The computer knows what a hand is."** It matches patterns in the example pictures, nothing more.
- **"100% means it's always right."** The score describes this one prediction, not real-world accuracy.
- **"No signal means anything else."** It means *what your No signal examples looked like*. New things still get forced into a class.

---

## Assessment checklist

- [ ] Three classes, with roughly balanced samples in Round 1
- [ ] A written prediction before testing
- [ ] Round 1 tests filled in for the normal position and one changed condition
- [ ] Round 2 retest with the **same** tests
- [ ] Challenge card: what failed, what was added, what happened, one limitation
- [ ] Can explain training examples vs. test examples in their own words

---

## Verified, and check before class

**Confirmed in official sources on October 17, 2026 (Teachable Machine version 2.4.18):**
- No account or login is needed ([FAQ](https://teachablemachine.withgoogle.com/faq)).
- Image classes can take samples from the **Webcam** or **Upload** (image files) ([FAQ](https://teachablemachine.withgoogle.com/faq)). Uploaded images are cropped to a square from the center (shown in the tool).
- The image project offers **Standard image model** (224×224 color images) or **Embedded image model** (96×96 greyscale). Use Standard.
- Tool labels: **Add a class**, **Edit class name** (pencil), **Hold to Record**, Settings (*FPS 24, Delay 2 seconds, Duration 6 seconds* by default), **Train Model**, **Advanced** (Epochs 50 by default), **Preview** with **Input ON** and **webcam / file**, **Output**, **Export Model**, **Under the hood** (85% training / 15% test samples).
- Samples aren't sent to servers unless saved to Drive. Training runs in the browser tab. Closing the tab without saving keeps nothing ([FAQ](https://teachablemachine.withgoogle.com/faq)).
- Launch post: "All the training happens in your browser, so everything stays in your computer" ([Google blog, Nov 7, 2019](https://blog.google/technology/ai/teachable-machine)).

**Not confirmed: please check yourself**
- **Supported browsers and devices.** The official FAQ doesn't list them. Test your exact student devices, especially tablets, phones, and managed Chromebooks.
- **School policy and age terms.** Teachable Machine links only to Google's general Privacy & Terms. Confirm webcam use and any age requirements with your district.
- **Hold to Record behavior on your devices.** The Settings panel has a Hold to Record toggle and a 6-second duration. Confirm how recording starts and stops on your devices before class.
- **Switching tabs during training.** The documentation doesn't say what happens. Tell students to keep the tab open and in front.
- **Accessibility.** The documentation doesn't describe screen reader or keyboard support. Pair students and plan support for anyone who can't use the mouse controls.
- **Output display.** Bars show a score per class. Labels and percentages may look slightly different between versions.

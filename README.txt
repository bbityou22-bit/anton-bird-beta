ANTON BIRD - BLANK LEVEL FIX

Replace the matching files in your existing Anton Bird folder.
Keep your existing style.css and asset folders (Birds, Bikes, Backgrounds), slingshot.png, and sound file.

Main fixes:
- Properly stops paused GameScene before loading another level.
- Starts the next scene on the following browser tick.
- Clears cached bird/bike textures so each level loads its correct image.

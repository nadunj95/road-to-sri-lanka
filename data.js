/* Road to Sri Lanka — Comeback Season. Ashanti's program, transcribed from
   "Comeback Season — Ashanti's Road to Sri Lanka" (revised Oct 20, 2026).
   Where the plan contradicts itself the app takes the more conservative reading;
   every such call is listed in "Plan decisions.md" in the project folder. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ exercises
     img: photo pair in ex/<img>-0.jpg / -1.jpg (empty = photo still to come)   fig: animated figure
     lower: progress in 10 lb steps (the plan: +10 lb on the hip thrust, +5 lb elsewhere)
     side: dosed per side or per leg   knee: knee-bending work (traffic light + "one level down")
     gate: 'gA'|'g1'|'g2'|'g3'|'g4' knee gates, 'bc' = back clear; alt: used while the gate is closed
     backAlt/backMax: swapped for the day when morning back stiffness is above backMax          */
  const EX = {
    /* Pull */
    pullup: { n: 'Pull-up, band-assisted or weighted', img: 'Pullups', eq: 'Pull-up bar · band, assist machine or dip belt', m: 'Lats, biceps', swapTo: 'ng_pulldown',
      cues: ['Start from a dead hang, shoulders pulled down first.', 'Assist machine: stand on the foot platform, not the kneeling pad.', 'Drive the elbows to your ribs, chest to the bar.'] },
    w_pullup: { n: 'Weighted pull-up', img: 'Weighted_Pull_Ups', eq: 'Pull-up bar · dip belt (band if needed)', m: 'Lats, biceps', swapTo: 'pullup',
      cues: ['Work up to one top set, then the back-offs 10% lighter.', 'Full dead hang between reps.', 'Chest to the bar, no kipping.'] },
    w_pullup_cluster: { n: 'Weighted pull-up clusters', img: 'Weighted_Pull_Ups', eq: 'Pull-up bar · dip belt', m: 'Lats, biceps', swapTo: 'pullup',
      cues: ['Load at about your 5-rep max.', 'Do 3 reps, rest 15 s, then 2 more: that is one set.', 'Full dead hang between reps.'] },
    cs_db_row: { n: 'Chest-supported DB row', img: 'Dumbbell_Incline_Row', eq: 'Dumbbells · incline bench', m: 'Mid back, lats, rear delts',
      cues: ['Chest on the incline bench, neck long.', 'Drive the elbows back toward your hips and squeeze the shoulder blades.', 'Pause 1 s at the top, lower for 2–3 s.'] },
    ng_pulldown: { n: 'Neutral-grip lat pulldown', img: 'V-Bar_Pulldown', eq: 'Cable · V-handle', m: 'Lats',
      cues: ['Let the handle pull you into a full stretch at the top.', 'Pull to your upper chest, elbows down to your ribs.', 'Shoulders stay away from your ears.'] },
    lat_pulldown: { n: 'Lat pulldown', img: 'Wide-Grip_Lat_Pulldown', eq: 'Cable · lat bar', m: 'Lats',
      cues: ['Full stretch at the top.', 'Pull the bar to your upper chest, elbows down and back.', 'Last set: 5 lengthened partials in the stretched half.'] },
    sa_pulldown: { n: 'Single-arm lat pulldown, seated', img: 'One_Arm_Lat_Pulldown', eq: 'Cable · single handle', m: 'Lats', side: true,
      cues: ['Sit tall, reach the arm up into a full stretch.', 'Pull the elbow down to your side.', 'No twisting through the torso.'] },
    face_pull: { n: 'Face pull', img: 'Face_Pull', eq: 'Cable · rope', m: 'Rear delts, rotator cuff, mid traps',
      cues: ['Rope at upper-chest height or a little higher.', 'Pull to your ears, then rotate the hands out and back.', 'Pause. Ribs down.'] },
    cable_row_1arm: { n: 'Seated 1-arm cable row', img: 'Seated_One-arm_Cable_Pulley_Rows', eq: 'Cable · single handle', m: 'Lats, mid back', side: true,
      cues: ['Tall posture, ribs down.', 'Row to the hip pocket, elbow close to the body.', 'Let the shoulder blade reach forward at the bottom.'] },
    straight_arm_pd: { n: 'Straight-arm cable pulldown', img: 'Straight-Arm_Pulldown', eq: 'Cable · bar or rope', m: 'Lats',
      cues: ['Hinge slightly, arms long with soft elbows.', 'Sweep the bar down to your thighs with the lats.', 'Shoulders stay down.'] },
    tbar_row: { n: 'Chest-supported T-bar row', img: 'Lying_T-Bar_Row', eq: 'Chest-supported T-bar machine', m: 'Mid back, lats',
      cues: ['Chest stays on the pad: no strain on the low back.', 'Row the elbows back and squeeze 1 s.', 'Last set: rest-pause (15 s, then 2 mini-sets).'] },
    barbell_row: { n: 'Barbell row', img: 'Bent_Over_Barbell_Row', eq: 'Barbell', m: 'Upper back, lats', gate: 'bc', alt: 'tbar_row', backAlt: 'tbar_row', backMax: 2,
      cues: ['Only once your back is clear (morning stiffness 0 for 7 days).', 'Hinge with a flat back, bar close to the legs.', 'Row to the lower ribs, lower under control.'] },
    reverse_pec_deck: { n: 'Reverse pec deck', img: 'Reverse_Machine_Flyes', eq: 'Pec deck machine', m: 'Rear delts, mid back',
      cues: ['Chest on the pad, arms long.', 'Sweep the handles out and back, pinkies leading.', 'No shrug; 1 s squeeze.'] },
    suitcase_carry: { n: 'Suitcase carry', fig: 'suitcase', eq: 'Dumbbell or kettlebell', m: 'Obliques, grip', side: true,
      cues: ['Light to moderate weight in one hand only.', 'Walk tall; do not lean toward or away from the weight.', 'Skip it today if the back is above 2.'] },
    incline_db_curl: { n: 'Incline DB curl', img: 'Incline_Dumbbell_Curl', eq: 'Dumbbells · incline bench', m: 'Biceps (long head)',
      cues: ['Bench at 45–60°, arms hanging straight down.', 'Curl without letting the elbows drift forward.', 'Lower all the way to a full stretch.'] },
    hammer_curl: { n: 'Hammer curl', img: 'Hammer_Curls', eq: 'Dumbbells', m: 'Brachialis, forearms',
      cues: ['Neutral grip, palms facing each other.', 'Elbows pinned to your sides.', 'No swinging; 2 s down.'] },
    ez_curl: { n: 'EZ-bar curl', img: 'EZ-Bar_Curl', eq: 'EZ bar', m: 'Biceps',
      cues: ['Elbows at your sides, wrists neutral.', 'Curl up, squeeze, lower for 2 s.', 'No hip swing.'] },
    ez_21s: { n: 'EZ-bar curl 21s', img: 'EZ-Bar_Curl', eq: 'EZ bar', m: 'Biceps',
      cues: ['7 reps in the bottom half, 7 in the top half, 7 full reps.', 'No rest between the parts.', 'Lighter than your normal curl weight.'] },
    inverted_row: { n: 'Inverted row', img: 'Inverted_Row', eq: 'Smith bar, rings or TRX', m: 'Upper back',
      cues: ['Body in a straight plank line.', 'Pull the chest to the bar.', 'Lower under control.'] },

    /* Push */
    incline_db: { n: '30° incline DB bench press', img: 'Incline_Dumbbell_Press', eq: 'Dumbbells · incline bench', m: 'Upper chest, shoulders, triceps',
      cues: ['Bench at 30°, shoulder blades set.', 'Lower to the upper chest, elbows about 45°.', 'Press up without banging the dumbbells.'] },
    seated_db_press: { n: 'Seated DB shoulder press, back on the pad', img: 'Seated_Dumbbell_Press', eq: 'Dumbbells · upright bench', m: 'Shoulders, triceps',
      cues: ['Back flat on the pad: the low back stays out of it.', 'Ribs down, press straight up.', 'Lower to ear height under control.'] },
    ohp: { n: 'Standing barbell overhead press', img: 'Standing_Military_Press', eq: 'Barbell', m: 'Shoulders, triceps, core', gate: 'bc', alt: 'seated_db_press', backAlt: 'seated_db_press', backMax: 2,
      cues: ['Only once your back is clear.', 'Squeeze glutes, ribs down, no lean back.', 'Press the bar up and slightly back over the mid-foot.'] },
    machine_chest_press: { n: 'Machine chest press', img: 'Leverage_Chest_Press', eq: 'Chest press machine', m: 'Chest, triceps',
      cues: ['Handles at mid-chest, shoulder blades back.', 'Press out without locking hard.', 'Control the return to a stretch.'] },
    bench: { n: 'Barbell bench press', img: 'Barbell_Bench_Press_-_Medium_Grip', eq: 'Barbell · bench', m: 'Chest, triceps',
      cues: ['Lower under control; no bounce off the chest.', 'Shoulder blades back and down, feet planted.', 'Bar to the lower chest, elbows about 45°.'] },
    incline_bb_bench: { n: 'Incline barbell bench press', img: 'Barbell_Incline_Bench_Press_-_Medium_Grip', eq: 'Barbell · incline bench', m: 'Upper chest, triceps',
      cues: ['Controlled, no bounce.', 'Bar to the upper chest.', 'Top set, then the back-offs 10% lighter.'] },
    db_bench: { n: 'DB bench press', img: 'Dumbbell_Bench_Press', eq: 'Dumbbells · flat bench', m: 'Chest, triceps',
      cues: ['Shoulder blades down and back.', 'Lower to the chest with elbows about 45°.', 'Press up and slightly in.'] },
    cable_lateral_behind: { n: 'Cable lateral raise from behind the body', img: 'Standing_Low-Pulley_Deltoid_Raise', eq: 'Cable · single handle', m: 'Side delts', side: true,
      cues: ['Cable runs behind your body.', 'Lead with the elbow, stop at shoulder height.', 'Shoulders down, 2 s on the way down.'] },
    cable_lateral: { n: 'Cable lateral raise', img: 'Standing_Low-Pulley_Deltoid_Raise', eq: 'Cable · single handle', m: 'Side delts', side: true,
      cues: ['Lead with the elbow.', 'Stop at shoulder height, no shrug.', 'Controlled lowering.'] },
    hl_cable_fly: { n: 'High-to-low cable fly', img: 'Cable_Crossover', eq: 'Cables · D-handles', m: 'Lower chest',
      cues: ['Pulleys high, sweep down toward the hips.', 'Soft elbows, hug a big tree.', 'Squeeze in front, stretch wide.'] },
    hl_crossover: { n: 'High-to-low cable crossover', img: 'Cable_Crossover', eq: 'Cables · D-handles', m: 'Lower chest',
      cues: ['Pulleys high, cross the hands low in front.', 'Soft elbows.', 'Stretch wide at the top.'] },
    lh_crossover: { n: 'Cable crossover, low to high', img: 'Cable_Crossover', eq: 'Cables · D-handles', m: 'Upper chest',
      cues: ['Pulleys low, sweep up to eye height.', 'Soft elbows, palms up.', 'Squeeze the upper chest at the top.'] },
    cable_er: { n: 'Cable external rotation', img: 'External_Rotation_with_Cable', eq: 'Cable · single handle', m: 'Rotator cuff', side: true,
      cues: ['Elbow tucked at your side, forearm across the belly.', 'Rotate the hand out like a door.', 'Slow back in; shoulder stays down.'] },
    oh_cable_tri: { n: 'Overhead cable rope triceps extension', img: 'Triceps_Overhead_Extension_with_Rope', eq: 'Cable · rope', m: 'Triceps (long head)',
      cues: ['Face away from the cable, rope behind the head.', 'Deep stretch behind the head, elbows pointing forward.', 'Extend fully, ribs down.'] },
    rope_pushdown: { n: 'Rope pushdown', img: 'Triceps_Pushdown_-_Rope_Attachment', eq: 'Cable · rope', m: 'Triceps',
      cues: ['Elbows pinned at your sides.', 'Push down and spread the rope at the bottom.', 'Control on the way up.'] },
    xbody_tri: { n: 'Cross-body cable triceps extension', img: 'Cable_One_Arm_Tricep_Extension', eq: 'Cable · single handle', m: 'Triceps', side: true,
      cues: ['Cable at shoulder height on the opposite side.', 'Extend the arm across the body, elbow fixed.', 'Full stretch, full lockout.'] },
    pushup: { n: 'Push-up', img: 'Pushups', eq: 'Bodyweight', m: 'Chest, triceps, core',
      cues: ['Straight line from head to heels.', 'Chest to the floor, full range.', 'Elbows about 45°.'] },

    /* Lower: hips (barely bend the knee) */
    hip_thrust: { n: 'Barbell hip thrust', img: 'Barbell_Hip_Thrust', eq: 'Barbell · bench · pad', m: 'Glutes', lower: true,
      cues: ['Upper back on the bench, chin tucked, ribs down: do not arch at the top.', 'Drive through the heels until the hips are level; 2 s pause.', 'All your attention in the glutes on the first working set.'] },
    sl_db_hip_thrust: { n: 'Single-leg DB hip thrust', img: '', eq: 'Dumbbell · bench', m: 'Glutes', side: true,
      cues: ['Shoulders on the bench, dumbbell on the working hip.', 'Right leg first.', 'Hips level at the top, 1 s squeeze.'] },
    db_rdl: { n: 'DB Romanian deadlift', img: 'Stiff-Legged_Dumbbell_Deadlift', eq: 'Dumbbells', m: 'Hamstrings, glutes', backAlt: 'pull_through', backMax: 2, swapTo: 'pull_through',
      cues: ['Soft knees, push the hips back.', 'Go down only as far as the back stays flat.', 'Back above 2 today: the app swaps in the cable pull-through.'] },
    bb_rdl: { n: 'Barbell Romanian deadlift', img: 'Romanian_Deadlift', eq: 'Barbell', m: 'Hamstrings, glutes', gate: 'bc', alt: 'db_rdl', backAlt: 'pull_through', backMax: 2, swapTo: 'pull_through',
      cues: ['Only once your back is clear.', 'Bar close to the legs, hips back, back neutral.', 'Keep it at the weight where your back stays neutral.'] },
    pull_through: { n: 'Cable pull-through', img: 'Band_Good_Morning_Pull_Through', eq: 'Cable · rope', m: 'Glutes, hamstrings',
      cues: ['Face away from the cable, rope between the legs.', 'Hinge back, then drive the hips through.', 'Squeeze the glutes at the top; no lower-back arch.'] },
    band_pull_through: { n: 'Band pull-through', img: 'Band_Good_Morning_Pull_Through', eq: 'Long loop band', m: 'Glutes, hamstrings',
      cues: ['Band anchored low behind you.', 'Hinge back, drive the hips through.', 'Squeeze the glutes at the top.'] },
    conv_deadlift: { n: 'Conventional deadlift', img: 'Barbell_Deadlift', eq: 'Barbell', m: 'Glutes, hamstrings, back', knee: true,
      cues: ['Needs Gate 2 and a clear back.', 'Reset every rep: brace, then push the floor away.', 'Lock out with the glutes, not by leaning back.'] },
    trapbar: { n: 'Trap-bar deadlift, light', img: 'Trap_Bar_Deadlift', eq: 'Trap bar', m: 'Glutes, hamstrings, quads', gate: 'bc', alt: 'pull_through', knee: true,
      cues: ['Only with a clear back (and Gate 1).', 'High handles, stand in the centre, brace.', 'Push the floor away; light weight.'] },
    back_ext: { n: '45° back extension, glute-biased', img: 'Hyperextensions_Back_Extensions', eq: '45° back-extension bench', m: 'Glutes', gate: 'bc', alt: 'glute_bridge_hold', backAlt: 'glute_bridge_hold', backMax: 2,
      cues: ['Only once your back is clear.', 'Round the upper back slightly, feet turned out, drive with the glutes.', 'Stop at a straight line; no over-arching.'] },
    reverse_hyper: { n: 'Reverse hyper or 45° back extension', img: 'Reverse_Hyperextension', eq: 'Reverse hyper, or a 45° back-extension bench', m: 'Glutes', gate: 'bc', alt: 'glute_bridge_hold', backAlt: 'glute_bridge_hold', backMax: 2,
      cues: ['Only once your back is clear. Reverse hyper if the gym has one.', 'Lift the legs with the glutes, 1 s squeeze.', 'Controlled lowering.'] },
    glute_bridge_hold: { n: 'Glute bridge hold', img: 'Butt_Lift_Bridge', eq: 'Floor', m: 'Glutes',
      cues: ['Feet flat, ribs down.', 'Bridge up and hold, squeezing the glutes.', 'Back stays neutral, no arch.'] },
    glute_bridge: { n: 'Glute bridge', img: 'Butt_Lift_Bridge', eq: 'Floor', m: 'Glutes',
      cues: ['Feet flat, ribs down.', 'Drive the hips up, squeeze 1 s.', 'Lower slowly.'] },
    banded_bridge: { n: 'Banded glute bridge', img: 'Butt_Lift_Bridge', eq: 'Mini band above the knees', m: 'Glutes',
      cues: ['Mini band above the knees, push out against it.', 'Drive the hips up, squeeze.', 'Lower slowly.'] },
    sl_glute_bridge: { n: 'Single-leg glute bridge', img: 'Butt_Lift_Bridge', eq: 'Floor', m: 'Glutes', side: true,
      cues: ['Right leg first, then left.', 'Hips level at the top.', 'Log the reps on each side: it is part of the glute index.'] },
    frog_pump: { n: 'Frog pump', img: '', eq: 'Floor', m: 'Glutes',
      cues: ['Lying on your back, soles of the feet together, knees out.', 'Drive the hips up, 1 s squeeze.', 'Ribs down.'] },
    cable_kickback: { n: 'Cable glute kickback', img: 'One-Legged_Cable_Kickback', eq: 'Cable · ankle cuff', m: 'Glutes', side: true,
      cues: ['Slight forward lean, hips square.', 'Kick back and slightly out with the glute, not the low back.', '1 s squeeze at the top.'] },
    hip_abd: { n: 'Seated hip abduction, 45° forward lean', img: '', eq: 'Hip abduction machine', m: 'Glute medius, upper glutes',
      cues: ['Lean forward about 45° from the hips.', 'Push the knees out, pause 1 s.', 'Control the return.'] },
    cable_abd: { n: 'Standing cable hip abduction', img: '', eq: 'Cable · ankle cuff', m: 'Glute medius', side: true,
      cues: ['Stand side-on to the cable, hold the frame.', 'Sweep the leg out with the toe forward.', 'No leaning; hips level.'] },
    calf_raise: { n: 'Standing calf raise', img: 'Standing_Calf_Raises', eq: 'Calf machine or step', m: 'Calves',
      cues: ['2 s pause at the bottom in a full stretch.', 'Rise as high as you can.', 'No bouncing.'] },
    sl_calf_raise: { n: 'Single-leg calf raise', img: '', eq: 'Step · support', m: 'Calves', side: true,
      cues: ['Hold something for balance.', '2 s pause at the bottom.', 'Rise as high as you can on one foot.'] },
    seated_calf: { n: 'Seated calf raise', img: 'Seated_Calf_Raise', eq: 'Seated calf machine', m: 'Calves (soleus)',
      cues: ['Full stretch at the bottom.', 'Rise as high as you can.', 'No bouncing.'] },

    /* Knee: rehab and the gated knee lifts */
    seated_leg_curl: { n: 'Seated leg curl', img: 'Seated_Leg_Curl', eq: 'Seated leg curl machine', m: 'Hamstrings', knee: true,
      cues: ['Seated, not lying: hips pinned.', '3 s on the way down.', 'Never closer than RIR 2 until Gate 2.'] },
    sl_leg_curl: { n: 'Single-leg seated leg curl', img: 'Seated_Leg_Curl', eq: 'Seated leg curl machine', m: 'Hamstrings', side: true, knee: true,
      cues: ['Right leg, then left.', 'Smooth, 2–3 s down.', 'The 10RM right ÷ left is your hamstring index.'] },
    sl_leg_ext: { n: 'Single-leg leg extension', img: 'Leg_Extensions', eq: 'Leg extension machine', m: 'Quads', side: true, knee: true,
      cues: ['Right leg, then left. Knee lined up with the machine pivot.', 'Until Gate 1: only from 90° to 45° (skip the last bit to straight).', '3 s down. The 10RM right ÷ left is your quad index.'] },
    iso_leg_ext: { n: 'Isometric leg extension, right leg', img: 'Leg_Extensions', eq: 'Leg extension machine', m: 'Quads', knee: true,
      cues: ['Knee held at a 60° bend; push against the pad at about 70% effort.', 'Hold 45 s, breathing.', 'Isometric holds are fine at any stage.'] },
    wall_sit: { n: 'Wall sit', fig: 'wall_sit', eq: 'Wall', m: 'Quads', knee: true,
      cues: ["Slide down to this week's angle, weight in the heels.", 'Knees over the 2nd toe, pain 0–2.', 'Stand up if the knee goes above 2.'] },
    spanish_squat: { n: 'Spanish squat hold', fig: 'spanish_squat', eq: 'Heavy band round a rack, behind both knees', m: 'Quads', knee: true,
      cues: ['Band behind both knees, step back until it is tight.', "Sit back to this week's angle, shins vertical.", 'Hold, breathing; knee pain 0–2.'] },
    step_down: { n: 'Slow step-down', fig: 'step_down', eq: '4-in step', m: 'Quads, glute medius', side: true, knee: true,
      cues: ['Stand on the step on the right leg.', 'Lower the other heel slowly to the floor, knee over the 2nd toe.', 'No knee cave, hips level.'] },
    lateral_walk: { n: 'Banded lateral walk', fig: 'lateral_walk', eq: 'Mini band above the knees', m: 'Glute medius',
      cues: ['Band above the knees, small quarter squat.', 'Step wide and keep tension on the band.', 'Toes forward, hips level.'] },
    balance_toss: { n: 'Single-leg balance on a pad, ball toss', fig: 'balance', eq: 'Balance pad · ball · wall', m: 'Knee control', knee: true,
      cues: ['Right leg on the pad, soft knee.', 'Toss a ball against the wall and catch it.', 'Knee stays over the 2nd toe.'] },
    sl_rdl_reach: { n: 'Bodyweight single-leg RDL to a reach', img: 'Kettlebell_One-Legged_Deadlift', eq: 'Bodyweight', m: 'Hamstrings, glutes, balance', side: true,
      cues: ['Hinge on one leg, reach the hands forward.', 'Hips square, back flat.', 'Skip it if the back is above 2.'] },
    bike_easy: { n: 'Easy bike, seat high', img: 'Bicycling_Stationary', eq: 'Bike (arm bike if pedalling hurts)', m: 'Warm-up',
      cues: ['Seat high so the knee bends less.', 'Easy pace, conversational.', 'Arm bike instead if pedalling hurts.'] },
    goblet_box_squat: { n: 'Goblet box squat to a knee-height box', img: 'Goblet_Squat', eq: 'Dumbbell · knee-height box', m: 'Quads, glutes', knee: true,
      cues: ['3 s down to touch the box, no plopping.', 'Bodyweight first, then a light dumbbell.', 'Knees over the toes, pain 0–2.'] },
    goblet_squat: { n: 'Goblet squat to parallel', img: 'Goblet_Squat', eq: 'Dumbbell or kettlebell', m: 'Quads, glutes', knee: true,
      cues: ['Weight at the chest, sit between the heels.', 'Down to parallel, chest tall.', 'Drive up through the whole foot.'] },
    lowbar_squat: { n: 'Low-bar back squat', img: 'Barbell_Squat', eq: 'Barbell · rack', m: 'Glutes, quads, adductors', knee: true,
      cues: ['Needs Gate 2.', 'Bar low on the rear delts, hips back, chest over the bar.', 'Top set, then the back-offs lighter.'] },
    leg_press: { n: 'Leg press, feet shoulder-width, to a 90° bend', img: 'Leg_Press', eq: 'Leg press machine', m: 'Quads, glutes', knee: true,
      cues: ['Normal stance, feet shoulder-width.', 'Down to a 90° knee bend, no deeper.', 'Week 7 light, then one plate more each week.'] },
    bw_split_squat: { n: 'Bodyweight split squat', img: 'Split_Squats', eq: 'Bodyweight', m: 'Quads, glutes', side: true, knee: true,
      cues: ['Long split stance, torso tall.', 'Lower straight down under control.', 'Front knee over the 2nd toe.'] },
    split_squat: { n: 'Split squat', img: 'Split_Squat_with_Dumbbells', eq: 'Bodyweight or dumbbells', m: 'Quads, glutes', side: true, knee: true,
      cues: ['Needs Gate 1.', 'Long split stance, lower straight down.', 'Front knee over the 2nd toe.'] },
    offset_rev_lunge: { n: 'Offset-DB reverse lunge, slow', img: '', eq: 'One dumbbell', m: 'Glutes, quads', side: true, knee: true,
      cues: ['Dumbbell in one hand: the core resists the lean.', 'Step back slowly, knee down under control.', 'Reverse lunges only; no forward or walking lunges.'] },
    bulgarian: { n: 'DB Bulgarian split squat, torso leaned forward', img: 'Split_Squat_with_Dumbbells', eq: 'Dumbbells · bench', m: 'Glutes, quads', side: true, knee: true,
      cues: ['Needs Gate 2 for load.', 'Rear foot on the bench, lean the torso forward for the glutes.', 'Drive through the front heel.'] },
    step_up: { n: 'DB forward-lean step-up to knee height', img: 'Dumbbell_Step_Ups', eq: 'Dumbbells · knee-height box', m: 'Glutes, quads', side: true, knee: true,
      cues: ['Lean the torso forward over the front leg.', 'Drive up through the heel, no push off the back foot.', 'Lower slowly.'] },
    pogo: { n: 'Pogo hops', img: '', eq: 'Bodyweight', m: 'Calves, landing control',
      cues: ['Gate 3 only.', 'Small, quick, quiet hops on the balls of the feet.', 'Stop the set when a landing gets loud.'] },
    box_jump: { n: 'Box jump, step down', img: 'Front_Box_Jump', eq: 'Low plyo box', m: 'Power, landing control',
      cues: ['Gate 3 only.', 'Land softly, knees over toes.', 'Always step down, never jump down.'] },
    jump_squat: { n: 'Bodyweight jump squat', img: 'Freehand_Jump_Squat', eq: 'Bodyweight', m: 'Power',
      cues: ['Gate 3 only.', 'Quarter dip, jump, land quietly.', 'Knees over toes on every landing.'] },

    /* Conditioning (Polo Day) */
    ski_erg: { n: 'Ski erg', img: '', eq: 'Ski erg', m: 'Conditioning', backAlt: 'arm_bike', backMax: 2,
      cues: ['Hinge a little and drive the handles down with the lats and core.', 'Knees soft, not a squat.', 'Back above 2 today: arm bike instead.'] },
    arm_bike: { n: 'Arm bike', img: '', eq: 'Arm ergometer', m: 'Conditioning',
      cues: ['Sit tall, ribs down.', 'Hard means hard; easy means really easy.', 'The knee- and back-friendly engine.'] },
    assault_bike: { n: 'Assault bike', img: '', eq: 'Air bike · seat raised', m: 'Conditioning', swapTo: 'ski_erg',
      cues: ['Only if pedalling has been pain-free (it bends the knee to about 110°).', 'Raise the seat.', 'Otherwise do the ski erg.'] },
    battle_ropes: { n: 'Battle ropes', img: 'Battling_Ropes', eq: 'Battle ropes', m: 'Conditioning, shoulders',
      cues: ['Athletic stance, soft knees.', 'Fast alternating waves from the shoulders.', 'Ribs down, breathe.'] },
    farmer: { n: "Farmer's carry", img: 'Farmers_Walk', eq: 'Dumbbells, kettlebells or handles', m: 'Grip, traps, core',
      cues: ['Shoulders packed down, walk tall.', 'Short, quick steps.', 'Heavy when the plan says heavy.'] },
    band_pull_apart: { n: 'Band pull-apart', img: 'Back_Flyes_-_With_Bands', eq: 'Band', m: 'Rear delts, mid back',
      cues: ['Arms straight in front at shoulder height.', 'Pull the band to your chest by spreading the arms.', 'Shoulders down.'] },
    kb_swing: { n: 'Kettlebell swing', img: 'One-Arm_Kettlebell_Swings', eq: 'Kettlebell', m: 'Glutes, hamstrings', gate: 'bc', alt: 'band_pull_through',
      cues: ['Only once your back is clear; otherwise band pull-through.', 'Hike the bell back, then snap the hips through.', 'Arms are ropes; the hips do the work.'] },
    sled_push: { n: 'Sled push', img: 'Sled_Push', eq: 'Sled', m: 'Legs, conditioning', gate: 'g1', alt: 'battle_ropes', knee: true,
      cues: ['Light to moderate load.', 'Arms locked, body at 45°, short powerful steps.', 'Moderate on Fridays: Lower B is tomorrow.'] },
    burpee_step: { n: 'Step-back burpee, no jump', img: '', eq: 'Bodyweight', m: 'Conditioning', gate: 'g1', alt: 'ski_erg', knee: true,
      cues: ['Hands down, step the feet back one at a time.', 'Step back in and stand. No jump.', 'Smooth, not frantic.'] },
    rower: { n: 'Rowing machine', img: 'Rowing_Stationary', eq: 'Rowing machine', m: 'Conditioning', gate: 'g2', alt: 'ski_erg', knee: true,
      cues: ['From Gate 2 only; ski erg until then.', 'Legs, then hips, then arms.', 'Fast drive, relaxed recovery.'] },
    hanging_knee_raise: { n: 'Hanging knee raise, curl the pelvis up', img: 'Knee_Hip_Raise_On_Parallel_Bars', eq: "Bar or captain's chair", m: 'Lower abs',
      cues: ['Curl the pelvis up first; the knees follow.', 'No swing.', 'Lower slowly.'] },
    pallof: { n: 'Pallof press', img: 'Pallof_Press', eq: 'Cable or band', m: 'Anti-rotation core', side: true,
      cues: ['Stand side-on to the cable, handle at the sternum.', 'Press straight out and resist the twist.', 'Hold 2 s, return.'] },
    side_plank: { n: 'Side plank', img: 'Side_Bridge', eq: 'Floor', m: 'Obliques', side: true,
      cues: ['Elbow under the shoulder.', 'Straight line head to heels.', 'Keep both sides within 5% of each other.'] },
    hollow_hold: { n: 'Hollow body hold', fig: 'hollow', eq: 'Floor', m: 'Abs',
      cues: ['Low back pressed into the floor.', 'Tucked first; extend when it is easy.', 'Breathe behind the brace.'] },
    dead_bug: { n: 'Dead bug, long exhale', img: 'Dead_Bug', eq: 'Floor', m: 'Deep core', side: true,
      cues: ['Low back pressed into the floor.', 'Extend opposite arm and leg slowly.', 'Long exhale as you reach.'] },
    walk: { n: 'Walk', img: 'Walking_Treadmill', eq: 'Outside if you can', m: 'Recovery, steps',
      cues: ['8,000–10,000 steps a day (10,000–11,000 in Peak).', 'One walk a week phone-free: no podcast, no calls.', 'Outside within an hour of waking counts as morning light.'] },
    swim: { n: 'Swim, freestyle with a pull buoy', fig: 'swim', eq: 'Pool · pull buoy', m: 'Conditioning',
      cues: ['Flutter kick only, open turns.', 'No breaststroke or eggbeater kick until Gates 3–4 (they twist the knee).', 'Your swimmer’s engine, knee-safe.'] },

    /* Core: Phase 1 circuits (Weeks 1–3) */
    reverse_crunch: { n: 'Reverse crunch, 3 s down', img: 'Reverse_Crunch', eq: 'Floor', m: 'Lower abs',
      cues: ['Curl the pelvis toward the ribs.', 'Lower for 3 s.', 'Low back stays flat on the floor.'] },
    heel_taps: { n: 'Heel taps, knees bent', fig: 'heel_taps', eq: 'Floor', m: 'Lower abs',
      cues: ['Hips and knees at 90°.', 'Tap one heel to the floor, return, switch.', 'Low back pressed down.'] },
    body_saw: { n: 'Body-saw plank', img: '', eq: 'Sliders', m: 'Anti-extension core',
      cues: ['Forearms down, feet on sliders, pelvis tucked.', 'Rock forward and back from the shoulders.', 'Ribs down, glutes on.'] },
    hollow_tuck: { n: 'Hollow hold, tucked', fig: 'hollow', eq: 'Floor', m: 'Abs',
      cues: ['Low back pressed into the floor.', 'Knees bent, shoulders lifted slightly.', 'Breathe behind the brace.'] },
    side_plank_l: { n: 'Side plank, left', img: 'Side_Bridge', eq: 'Floor', m: 'Obliques',
      cues: ['Elbow under the shoulder.', 'Straight line head to heels.', 'Match the right side within 5%.'] },
    side_plank_r: { n: 'Side plank, right', img: 'Side_Bridge', eq: 'Floor', m: 'Obliques',
      cues: ['Elbow under the shoulder.', 'Straight line head to heels.', 'Match the left side within 5%.'] },
    pallof_l: { n: 'Standing Pallof press, left', img: 'Pallof_Press', eq: 'Cable or band', m: 'Anti-rotation',
      cues: ['Standing: the work that controls the knee on one leg.', 'Press out and resist the twist.', 'Ribs down.'] },
    pallof_r: { n: 'Standing Pallof press, right', img: 'Pallof_Press', eq: 'Cable or band', m: 'Anti-rotation',
      cues: ['Standing, side-on to the cable.', 'Press out and resist the twist.', 'Ribs down.'] },
    bird_dog_core: { n: 'Bird dog, 3 s holds, pad under the knee', fig: 'bird_dog', eq: 'Floor · pad', m: 'Back extensors, glutes',
      cues: ['Pad under the right knee.', 'Opposite arm and leg long, hold 3 s.', 'Hips stay level.'] },
    ball_crunch: { n: 'Crunch on a stability ball, hands on chest', img: 'Exercise_Ball_Crunch', eq: 'Stability ball', m: 'Upper abs',
      cues: ['Ball under the low back.', 'Hands on the chest, never on the head.', 'Exhale hard as you curl up.'] },
    ball_rollout: { n: 'Stability-ball rollout, short range', img: 'Barbell_Ab_Rollout_-_On_Knees', eq: 'Stability ball · pad', m: 'Anti-extension',
      cues: ['Kneel on a thick pad, weight on the left knee until Gate 1.', 'Roll out a short way, ribs down.', 'Pull back with the abs.'] },
    glute_bridge_march: { n: 'Glute bridge march', img: 'Butt_Lift_Bridge', eq: 'Floor', m: 'Glutes, core',
      cues: ['Bridge up, hips level.', 'Lift one knee, then the other.', "Don't let the hips drop or twist."] },
    bear_taps: { n: 'Bear plank shoulder taps, knees hovering', fig: 'bear_taps', eq: 'Floor', m: 'Core, shoulders',
      cues: ['Knees hovering an inch off the floor.', 'Tap the opposite shoulder slowly.', 'Hips stay still.'] },
    vacuum: { n: 'Stomach vacuum', img: 'Stomach_Vacuum', eq: 'None', m: 'Transverse abdominis',
      cues: ['Exhale everything.', 'Draw the belly up and in.', 'Hold with small sips of air.'] },
    /* Core: Phase 2 circuits (Weeks 4–6) */
    rc_hip_lift: { n: 'Reverse crunch to hip lift', img: 'Reverse_Crunch', eq: 'Floor', m: 'Lower abs',
      cues: ['Curl the knees in, then lift the hips off the floor.', 'Lower slowly.', 'Arms pressing into the floor.'] },
    ab_wheel: { n: 'Ab wheel from the knees, on a pad', img: 'Ab_Roller', eq: 'Ab wheel · thick pad', m: 'Anti-extension', gate: 'bc', alt: 'body_saw',
      cues: ['Back clear only; body-saw plank until then.', 'Thick pad, weight on the left knee until Gate 1.', 'Roll as far as you can hold a flat back.'] },
    weighted_dead_bug: { n: 'Weighted dead bug', img: 'Dead_Bug', eq: 'Light dumbbell or plate', m: 'Deep core', side: true,
      cues: ['Weight held over the chest.', 'Low back pressed down.', 'Long exhale on every reach.'] },
    hollow_ext: { n: 'Hollow hold, arms extended', fig: 'hollow', eq: 'Floor', m: 'Abs',
      cues: ['Arms by the ears, legs long and low.', 'Low back stays pressed down.', 'Bend the knees to regress.'] },
    cable_chop_l: { n: 'Standing cable chop, high to low, left', img: 'Standing_Cable_Wood_Chop', eq: 'Cable · rope', m: 'Obliques',
      cues: ['Standing (no kneeling on the right knee yet).', 'High to low across the body, hips square.', 'Control the return.'] },
    cable_chop_r: { n: 'Standing cable chop, high to low, right', img: 'Standing_Cable_Wood_Chop', eq: 'Cable · rope', m: 'Obliques',
      cues: ['Standing, hips square.', 'High to low across the body.', 'Control the return.'] },
    suitcase_march: { n: 'Suitcase march, heavy KB', fig: 'suitcase', eq: 'Kettlebell', m: 'Obliques',
      cues: ['Heavy bell in one hand, march in place.', 'Stay perfectly tall.', 'Switch sides at 20 s.'] },
    side_plank_dips: { n: 'Side plank hip dips', img: 'Side_Bridge', eq: 'Floor', m: 'Obliques',
      cues: ['Side plank, lower the hip toward the floor.', 'Lift back up past neutral.', 'Switch sides at 20 s.'] },
    bicycle: { n: 'Slow bicycle crunch, hands on chest', img: 'Air_Bike', eq: 'Floor', m: 'Obliques',
      cues: ['Hands on the chest, not behind the head.', 'Rotate the ribcage toward the knee.', 'Slow and controlled.'] },
    rope_crunch: { n: 'Kneeling rope cable crunch (pad), neck neutral', img: 'Cable_Crunch', eq: 'Cable · rope · thick pad', m: 'Upper abs',
      cues: ['Thick pad; until Gate 1 keep the weight off the right knee.', 'Curl the ribs toward the pelvis.', 'Neck neutral; hips do not move.'] },
    plate_crunch: { n: 'Plate-loaded crunch', img: 'Weighted_Crunches', eq: 'Plate', m: 'Upper abs',
      cues: ['Plate on the chest, not behind the head.', 'Curl up, exhale hard.', 'Lower slowly.'] },
    long_plank: { n: 'Long-lever plank with posterior tilt', img: 'Plank', eq: 'Floor', m: 'Anti-extension',
      cues: ['Elbows further forward than a normal plank.', 'Pelvis tucked, glutes on.', 'Hold the line.'] },
    tuck_vsit: { n: 'Tuck V-sit hold', img: 'Seated_Leg_Tucks', eq: 'Floor', m: 'Abs',
      cues: ['Balance on the sit bones.', 'Knees tucked, chest tall.', 'Hold.'] },
    /* Core: Phase 3 and 4 circuits (Weeks 7–12) */
    hlr_straight: { n: 'Straight-leg hanging leg raise', img: 'Hanging_Leg_Raise', eq: 'Pull-up bar', m: 'Lower abs',
      cues: ['Strict: no swing, no kip.', 'Pelvis first, then the legs.', 'Build toward toes-to-bar.'] },
    hang_oblique: { n: 'Alternating hanging oblique knee raise', img: 'Knee_Hip_Raise_On_Parallel_Bars', eq: "Bar or captain's chair", m: 'Obliques',
      cues: ['Raise the knees toward one elbow.', 'Alternate sides.', 'Control the descent.'] },
    ab_wheel_full: { n: 'Ab wheel, full range from the knees (standing if you can)', img: 'Ab_Roller', eq: 'Ab wheel · thick pad', m: 'Anti-extension', gate: 'bc', alt: 'body_saw',
      cues: ['Back clear only.', 'Hips forward, ribs down.', 'Standing rollouts only once full range from the knees is easy.'] },
    dragon_flag: { n: 'Dragon flag negative', img: 'Flat_Bench_Lying_Leg_Raise', eq: 'Bench', m: 'Abs', gate: 'bc', alt: 'lying_leg_raise',
      cues: ['Back clear only.', 'Hold the bench behind your head, body straight from the shoulders.', 'Lower as slowly as you can.'] },
    lying_leg_raise: { n: 'Lying leg raise with hip lift', img: 'Flat_Bench_Lying_Leg_Raise', eq: 'Bench or floor', m: 'Lower abs',
      cues: ['Raise the legs to vertical.', 'Lift the hips off the bench.', 'Lower slowly, back flat.'] },
    hollow_rock: { n: 'Hollow rock', fig: 'hollow_rock', eq: 'Floor', m: 'Abs',
      cues: ['Hold the hollow position.', 'Rock gently from shoulders to hips.', 'Low back stays pressed down.'] },
    landmine_rainbow: { n: 'Landmine rainbow', img: 'Landmine_180s', eq: 'Landmine · barbell', m: 'Obliques', gate: 'bc', alt: 'cable_chop',
      cues: ['Back clear only (loaded rotation).', 'Arms long, sweep the bar side to side.', 'Hips and ribs stay square.'] },
    cable_chop: { n: 'Standing cable chop', img: 'Standing_Cable_Wood_Chop', eq: 'Cable · rope', m: 'Obliques',
      cues: ['Standing, hips square.', 'High to low across the body.', 'Switch sides at 20 s.'] },
    cable_lift: { n: 'Standing cable lift, low to high', img: 'Standing_Cable_Lift', eq: 'Cable · rope', m: 'Obliques',
      cues: ['Low to high across the body.', 'Switch sides at 20 s.', 'Ribs down.'] },
    side_plank_leg: { n: 'Side plank with top-leg raise', img: 'Side_Bridge', eq: 'Floor', m: 'Obliques, glute medius',
      cues: ['Side plank, raise the top leg.', 'Hips stay stacked.', 'Switch sides at 20 s.'] },
    pallof_hold: { n: 'Pallof press hold', img: 'Pallof_Press', eq: 'Cable or band', m: 'Anti-rotation',
      cues: ['Press out and hold.', 'Resist the twist.', 'Switch sides at 20 s.'] },
    heavy_suitcase: { n: 'Heavy suitcase carry', fig: 'suitcase', eq: 'Dumbbell or kettlebell', m: 'Obliques, grip',
      cues: ['Walk tall with one heavy weight.', 'Switch sides at 20 s.', "Don't lean."] },
    weighted_rope_crunch: { n: 'Weighted rope cable crunch', img: 'Cable_Crunch', eq: 'Cable · rope · thick pad', m: 'Upper abs',
      cues: ['Heavier than Phase 2.', 'Curl ribs to pelvis.', 'Neck neutral.'] },
    vup: { n: 'V-up', img: 'Jackknife_Sit-Up', eq: 'Floor', m: 'Abs', gate: 'bc', alt: 'tuck_up',
      cues: ['Back clear only.', 'Arms and legs meet over the hips.', 'Lower with control.'] },
    tuck_up: { n: 'Tuck-up', img: 'Tuck_Crunch', eq: 'Floor', m: 'Abs',
      cues: ['Knees and chest come together.', 'Exhale hard.', 'Lower slowly.'] },
    stir_pot: { n: 'Stir-the-pot on a stability ball', fig: 'stir_pot', eq: 'Stability ball', m: 'Anti-extension, anti-rotation',
      cues: ['Forearm plank on the ball.', 'Draw small circles with the forearms.', 'Switch direction halfway.'] },

    /* Knee Armor, Back Reset, Deep Core, ramps, mobility */
    quad_set: { n: 'Quad sets', fig: 'quad_set', eq: 'Towel under the knee', m: 'Quads (VMO)',
      cues: ['Leg straight, towel under the knee.', 'Press the knee down and tighten the thigh; the kneecap should glide up.', 'Hold 5 s.'] },
    slr: { n: 'Straight-leg raise', fig: 'slr', eq: 'Floor · 2–5 lb ankle weight once 12 is easy', m: 'Quads, hip flexors', side: false,
      cues: ['Lock the knee first (quad set), other knee bent.', 'Lift to the height of the other knee.', 'Add a 2–5 lb ankle weight once 12 is easy.'] },
    tke: { n: 'Banded terminal knee extension', fig: 'tke', eq: 'Band behind the right knee', m: 'Quads',
      cues: ['Band behind the right knee, anchored in front.', 'From a slight bend to fully straight.', '2 s squeeze at straight.'] },
    balance_alpha: { n: 'Single-leg balance with alphabet tracing', fig: 'balance', eq: 'Floor (pillow or pad from Week 3)', m: 'Knee and hip control',
      cues: ['Stand on the right leg, soft knee.', 'Trace A to Z in the air with the left foot.', 'Knee stays over the 2nd toe.'] },
    hip_lift: { n: 'Hip lift (pelvic hike)', fig: 'hip_lift', eq: 'Wall for balance', m: 'Glute medius',
      cues: ['Side-on to a wall, stand on the right leg.', 'Let the left hip drop, then lift it level with the right glute.', '2 × 12, then the other side.'] },
    heel_slide: { n: 'Heel slides', fig: 'heel_slide', eq: 'Floor', m: 'Knee bend',
      cues: ['Only while the right knee does not bend as far as the left.', 'Slide the heel toward the glute, then back.', 'Easy, no forcing.'] },
    cat_camel: { n: 'Cat-camel', fig: 'cat_camel', eq: 'Floor · pad under the right knee', m: 'Spine mobility',
      cues: ['Pad under the right knee.', 'Slow arch and round, no forcing.', 'Move with the breath.'] },
    curl_up: { n: 'Curl-up', fig: 'curl_up', eq: 'Floor', m: 'Abs (spine-sparing)',
      cues: ['On your back, one knee bent, hands under the low back.', 'Lift head and shoulders an inch as one unit.', 'Hold 8 s; never pull on the head.'] },
    side_plank_knee: { n: 'Side plank from the knees', fig: 'side_plank_knee', eq: 'Floor', m: 'Obliques, quadratus lumborum', side: true,
      cues: ['Elbow under the shoulder, knees bent.', 'Lift the hips into a straight line.', 'Log both sides; if one is weaker, give it one extra hold.'] },
    bird_dog: { n: 'Bird dog', fig: 'bird_dog', eq: 'Floor · pad under the right knee', m: 'Back extensors, glutes', side: true,
      cues: ['Opposite arm and leg out, hips level.', 'Hold 8 s.', 'Pad under the right knee.'] },
    hip_flexor_stand: { n: 'Standing hip-flexor stretch', fig: 'hip_flexor_stand', eq: 'Floor', m: 'Hip flexors', side: true,
      cues: ['Split stance, right foot back.', 'Squeeze the back glute, ribs down.', 'No kneeling version yet.'] },
    quad_stretch: { n: 'Standing quad stretch', fig: 'quad_stretch', eq: 'Wall for balance', m: 'Quads', side: true,
      cues: ['Hold a wall, heel toward the glute.', 'Knees together, glute squeezed.', 'Gentle on the right knee: no forcing.'] },
    hip_switch: { n: '90/90 hip switches', fig: 'hip_switch', eq: 'Floor', m: 'Hip rotation',
      cues: ['Sit with both knees at 90°.', 'Rotate the knees to the other side.', 'Tall spine; use your hands if needed.'] },
    croc_breath: { n: 'Crocodile breathing', fig: 'croc', eq: 'Floor', m: 'Diaphragm',
      cues: ['Face down, forehead on your hands.', 'Breathe into the belly, sides and low back.', '5 slow breaths.'] },
    draw_in: { n: 'Hands-and-knees draw-in', fig: 'draw_in', eq: 'Floor · pad under the right knee', m: 'Transverse abdominis',
      cues: ['On all fours, pad under the right knee.', 'Draw the navel gently toward the spine; back stays still.', 'Keep breathing.'] },
    pelvic_lift: { n: 'Pelvic floor + deep ab lift', fig: 'breath', eq: 'None', m: 'Pelvic floor, TVA',
      cues: ['On the exhale, lift the pelvic floor and draw in lightly.', 'Hold 5 s.', 'Release fully.'] },
    hollow_body: { n: 'Hollow body hold, tucked then extended', fig: 'hollow', eq: 'Floor', m: 'Abs',
      cues: ['Low back pressed into the floor.', 'Start tucked; extend when it is easy.', 'Breathe.'] },
    band_er: { n: 'Band external rotation', img: 'External_Rotation_with_Band', eq: 'Band', m: 'Rotator cuff', side: true,
      cues: ['Elbow at your side.', 'Rotate the hand out like a door.', 'Slow back in.'] },
    scap_pushup: { n: 'Scap push-up', fig: 'scap_pushup', eq: 'Floor', m: 'Serratus',
      cues: ['Arms straight in a plank (knees down is fine; pad under the right knee).', 'Let the chest sink between the shoulder blades, then push the floor away.', 'Elbows stay straight.'] },
    scap_pullup: { n: 'Scap pull-up', img: 'Scapular_Pull-Up', eq: 'Pull-up bar', m: 'Lower traps, lats',
      cues: ['Hang with straight arms.', 'Pull the shoulder blades down without bending the elbows.', 'Pause 1 s, release slowly.'] },
    thoracic_ext: { n: 'Thoracic extension over a roller', fig: 'thoracic_ext', eq: 'Foam roller', m: 'Upper back mobility',
      cues: ['Roller across the upper back, hands behind the head.', 'Extend back over it, ribs down.', 'Move it up one segment and repeat.'] },
    glute_squeeze: { n: 'Glute squeezes', fig: 'glute_squeeze', eq: 'Standing', m: 'Glutes',
      cues: ['Stand tall.', 'Squeeze both glutes hard for 2–3 s.', 'A few reps, then back to work.'] },
    stand_up: { n: 'Stand up', img: 'Walking_Treadmill', eq: 'None', m: 'Circulation', cues: ['Stand up and move for a moment.'] },
  };

  /* -------------------------------------------------------------- prescriptions
     I(k, ex, sets, reps, rest, more): k = slot ('A' straight set, 'B1'/'B2' superset)
     more: note, side, time (s), timeLabel, dist, restLabel, scheme 'top' (topReps, topRIR, backPct, backTxt),
           rx (display override), setReps/setRest (per-set targets), cat ('up'|'hip'|'knee'|'lab') for the RIR rule,
           tech, techGate (technique only once that gate is open), fin (finisher: optional on yellow / holiday days),
           kind ('emom'|'pump'|'interval'), v: week variants [{ from, gate, ...overrides }] (latest open one wins;
           a closed gate falls back to the variant below it, "the level below"), skip (item left out),
           backSkip n (skipped when back stiffness > n), altRx { exKey: { reps, time, ... } } (dose when swapped). */
  const I = (k, ex, sets, reps, rest, more) => Object.assign({ k, ex, sets, reps, rest }, more || {});
  const HOLD90 = { ex: 'spanish_squat', sets: 4, reps: '', time: 45, rest: 60, scheme: null, cat: 'lab', rx: null, setReps: null, setRest: null, rir: '3',
    note: 'Squats wait for the gate: Knee Lab angle-ladder hold at 90° instead (or a pain-free angle).' };
  const HOLD30 = { ex: 'spanish_squat', sets: 3, reps: '', time: 30, rest: 60, scheme: null, cat: 'lab', rx: null, rir: '3',
    note: 'Waits for the gate: Spanish squat hold at 90° (or a pain-free angle) instead.' };

  /* Phase 1: Protect (Weeks 1–2) */
  const P1 = {
    pull: { title: 'Pull', sub: 'Upper A', dur: '55–65 min', ramp: 'upper', core: 'A', hero: 'cs_db_row', items: [
      I('A', 'pullup', 4, '5–8', 120, { cat: 'up', note: 'Band-assisted or weighted. Assist machine: foot platform, not the kneeling pad.' }),
      I('B', 'cs_db_row', 3, '8–10', 90, { cat: 'up', note: 'Incline bench' }),
      I('C1', 'ng_pulldown', 3, '10–12', 0, { cat: 'up', note: 'Full stretch at the top' }), I('C2', 'face_pull', 3, '15', 60, { cat: 'up' }),
      I('D1', 'cable_row_1arm', 3, '12', 0, { cat: 'up', side: true }), I('D2', 'straight_arm_pd', 3, '12–15', 60, { cat: 'up' }),
      I('E1', 'incline_db_curl', 3, '10–12', 0, { cat: 'up' }), I('E2', 'hammer_curl', 3, '10–12', 45, { cat: 'up' }),
    ] },
    lower: { title: 'Lower', sub: 'Glutes + knee strength', dur: '60–70 min', ramp: 'lower', core: 'B', hero: 'hip_thrust', items: [
      I('A', 'hip_thrust', 3, '10', 150, { cat: 'hip', note: '2 s pause, ribs down (don’t arch the back at the top). Week 1: 3 × 10 · Week 2: 4 × 8', v: [{ from: 2, sets: 4, reps: '8' }] }),
      I('B', 'db_rdl', 3, '10', 90, { cat: 'hip', note: 'Soft knees, down to where the back stays flat (cable pull-through if the back is above 2)' }),
      I('C1', 'seated_leg_curl', 3, '12', 0, { cat: 'knee', note: '3 s down' }), I('C2', 'sl_leg_ext', 3, '12', 60, { cat: 'knee', side: true, note: '90° to 45° range, 3 s down, right then left' }),
      I('D1', 'cable_kickback', 3, '12', 0, { cat: 'hip', side: true, note: 'Slight forward lean' }), I('D2', 'hip_abd', 3, '15', 60, { cat: 'hip', note: '45° forward lean' }),
      I('E1', 'frog_pump', 2, '20', 0, { cat: 'hip', note: 'Lying, soles of the feet together, 1 s squeeze' }), I('E2', 'calf_raise', 3, '12', 45, { cat: 'hip', note: '2 s pause at the bottom' }),
    ] },
    push: { title: 'Push', sub: 'Upper A', dur: '55–60 min', ramp: 'upper', core: 'C', hero: 'incline_db', items: [
      I('A', 'incline_db', 4, '8–10', 120, { cat: 'up', note: '30° bench' }),
      I('B', 'seated_db_press', 3, '8–10', 90, { cat: 'up', note: 'Back on the pad' }),
      I('C1', 'machine_chest_press', 3, '10–12', 0, { cat: 'up' }), I('C2', 'cable_lateral_behind', 3, '15', 60, { cat: 'up', side: true }),
      I('D1', 'hl_cable_fly', 3, '12–15', 0, { cat: 'up' }), I('D2', 'cable_er', 2, '15', 45, { cat: 'up', side: true }),
      I('E1', 'oh_cable_tri', 3, '12', 0, { cat: 'up', note: 'Deep stretch behind the head' }), I('E2', 'rope_pushdown', 3, '12–15', 45, { cat: 'up' }),
    ] },
  };

  /* Phase 2: Rebuild (Weeks 3–6) */
  const P2 = {
    pull: { title: 'Pull', sub: 'Upper B', dur: '55–65 min', ramp: 'upper', core: 'A', hero: 'w_pullup', items: [
      I('A', 'w_pullup', 4, '6–8', 120, { cat: 'up', scheme: 'top', topReps: '5–6', topRIR: '1', backPct: 10 }),
      I('B', 'barbell_row', 4, '8', 90, { cat: 'up', tech: 'Last set: rest-pause', note: 'Chest-supported T-bar row until your back is clear, then the barbell row' }),
      I('C1', 'sa_pulldown', 3, '12', 0, { cat: 'up', side: true }), I('C2', 'reverse_pec_deck', 3, '15', 60, { cat: 'up' }),
      I('D1', 'face_pull', 3, '15', 0, { cat: 'up' }), I('D2', 'suitcase_carry', 2, '', 60, { cat: 'up', dist: '40 steps', side: true, backSkip: 2, note: 'Light to moderate, walking tall (skip if the back is above 2)' }),
      I('E1', 'ez_curl', 3, '8–10', 0, { cat: 'up' }), I('E2', 'incline_db_curl', 3, '10–12', 45, { cat: 'up', tech: 'Last set: myo-reps' }),
    ] },
    lower: { title: 'Lower', sub: 'Glutes + knee strength', dur: '60–70 min', ramp: 'lower', core: 'B', hero: 'hip_thrust', items: [
      I('A', 'hip_thrust', 3, '8', 150, { cat: 'hip', scheme: 'top', topReps: '6–8', topRIR: '1–2', backPct: 20, backTxt: 'at ~80%', note: '2 s pause on the back-offs' }),
      I('B', 'bb_rdl', 3, '8', 120, { cat: 'hip', note: 'Barbell once your back is clear, otherwise DB' }),
      I('C', 'sl_db_hip_thrust', 3, '10', 75, { cat: 'hip', side: true, note: 'Shoulders on the bench, right leg first' }),
      I('D1', 'seated_leg_curl', 3, '10', 0, { cat: 'knee', note: '3 s down. (Lengthened partials wait for Gate 2.)' }),
      I('D2', 'sl_leg_ext', 3, '12', 60, { cat: 'knee', side: true, note: '90° to 45° range until Gate 1, 3 s down' }),
      I('E1', 'cable_kickback', 3, '12', 0, { cat: 'hip', side: true, tech: 'Last set: myo-reps' }),
      I('E2', 'back_ext', 3, '12', 60, { cat: 'hip', note: 'Glute-biased, once your back is clear; otherwise glute bridge hold 3 × 30 s', altRx: { glute_bridge_hold: { reps: '', time: 30 } } }),
      I('F', 'calf_raise', 3, '12', 45, { cat: 'hip', note: '2 s pause' }),
    ] },
    push: { title: 'Push', sub: 'Upper B', dur: '55–60 min', ramp: 'upper', core: 'C', hero: 'bench', items: [
      I('A', 'bench', 4, '8', 120, { cat: 'up', scheme: 'top', topReps: '5–6', topRIR: '1', backPct: 10, note: 'Lowered under control, no bounce off the chest' }),
      I('B', 'ohp', 3, '6–8', 120, { cat: 'up', note: 'Seated DB press until your back is clear, then the standing barbell press' }),
      I('C1', 'incline_db', 3, '10', 0, { cat: 'up' }), I('C2', 'cable_lateral_behind', 3, '15', 60, { cat: 'up', side: true }),
      I('D', 'lh_crossover', 3, '15', 45, { cat: 'up' }),
      I('E1', 'oh_cable_tri', 3, '10–12', 0, { cat: 'up', tech: 'Last set: drop set' }), I('E2', 'xbody_tri', 3, '12–15', 45, { cat: 'up', side: true }),
    ] },
  };

  /* Phase 3: Reload Legs (Weeks 7–10) and Phase 4: Peak (Weeks 11–12) */
  const JUMP = (k, ex, sets, reps) => I(k, ex, sets, reps, 60, { skip: true, v: [{ from: 7, gate: 'g3', skip: false }], note: 'Gate 3 only. Land quietly, knees over toes; stop the set when a landing gets loud.', jump: true });
  const ARM_PUMP = (a, b) => [
    I('P1', a, 2, '15', 0, { cat: 'up', fin: true, skip: true, v: [{ from: 11, skip: false }], note: 'Arm pump finisher: lighter, 15 reps each, 30 s rest, 2 rounds' }),
    I('P2', b, 2, '15', 30, { cat: 'up', fin: true, skip: true, v: [{ from: 11, skip: false }] })];
  const GLUTE_PUMP = I('G', 'cable_kickback', 1, '', 0, { kind: 'pump', fin: true, skip: true, v: [{ from: 11, skip: false }], rounds: 3, restR: 30,
    items: [{ ex: 'cable_kickback', label: '15 per side' }, { ex: 'hip_abd', label: '15' }, { ex: 'banded_bridge', label: '15' }],
    label: 'Glute pump finisher (8 min): 3 rounds, 30 s rest' });
  const P3 = {
    pull: { title: 'Pull', sub: 'Upper C', dur: '55–65 min', ramp: 'upper', core: 'A', hero: 'w_pullup_cluster', items: [
      I('A', 'w_pullup_cluster', 5, '3+2', 120, { cat: 'up', tech: 'Cluster: 15 s between mini-sets', note: 'At ~5RM' }),
      I('B', 'barbell_row', 4, '8', 90, { cat: 'up', note: 'Barbell row once your back is clear, otherwise chest-supported T-bar row' }),
      I('C', 'lat_pulldown', 3, '12', 60, { cat: 'up', tech: 'Last set + 5 lengthened partials' }),
      I('D1', 'cable_row_1arm', 3, '12', 0, { cat: 'up', side: true }), I('D2', 'reverse_pec_deck', 3, '15', 0, { cat: 'up' }), I('D3', 'face_pull', 3, '15', 60, { cat: 'up' }),
      I('E1', 'ez_21s', 2, '21', 0, { cat: 'up', note: '7 bottom half, 7 top half, 7 full' }), I('E2', 'hammer_curl', 3, '10', 45, { cat: 'up', tech: 'Last set: myo-reps' }),
      I('F', 'ski_erg', 1, '', 0, { kind: 'emom', fin: true, minutes: 6, odd: { ex: 'ski_erg', label: '10 cal ski erg' }, even: { ex: 'inverted_row', label: '8 inverted rows' } }),
    ].concat(ARM_PUMP('ez_curl', 'hammer_curl')) },
    lowerA: { title: 'Lower A', sub: 'Squat + glutes', dur: '65–75 min', ramp: 'lower', core: 'B', hero: 'hip_thrust', items: [
      JUMP('J1', 'pogo', 3, '15'), JUMP('J2', 'box_jump', 3, '3'), JUMP('J3', 'jump_squat', 3, '5'),
      I('A', 'spanish_squat', 4, '', 60, Object.assign({}, HOLD90, { v: [
        { from: 7, gate: 'g1', ex: 'goblet_box_squat', sets: 3, reps: '8', time: null, rest: 150, restLabel: '2–3 min', cat: 'knee', rir: '3', note: '3 s down to a knee-height box; bodyweight, then a light DB' },
        { from: 8, gate: 'g1', ex: 'goblet_squat', sets: 4, reps: '8', time: null, rest: 150, restLabel: '2–3 min', cat: 'knee', rir: '2', note: 'To parallel' },
        { from: 9, gate: 'g2', ex: 'lowbar_squat', sets: 3, reps: '8', time: null, rest: 150, restLabel: '2–3 min', cat: 'knee', scheme: 'top', topReps: '5', topRIR: '2', backPct: 15, rir: null, note: 'Gate 2: top set, then back-offs 15% lighter' },
        { from: 11, gate: 'g2', ex: 'lowbar_squat', sets: 3, reps: '6', time: null, rest: 150, restLabel: '2–3 min', cat: 'knee', scheme: 'top', topReps: '3–5', topRIR: '1', backPct: 12, rir: null, peakLift: true, note: 'Peak: your heaviest top set of the block' }] })),
      I('B', 'hip_thrust', 3, '8', 150, { cat: 'hip', scheme: 'top', topReps: '5', topRIR: '1', backPct: 20, backTxt: 'at ~80%', note: '2 s pauses on the back-offs',
        v: [{ from: 11, scheme: null, sets: 6, reps: '3', setReps: ['3', '3', '3', '3', '3', '10'], setRest: [20, 20, 20, 20, 150, 150], rx: '5 × 3 clusters at your top-set weight, 20 s racked, then 1 × 10 at ~70% with pauses', note: 'Peak: hip-thrust clusters', tech: 'Cluster sets' }] }),
      I('C', 'spanish_squat', 3, '', 60, Object.assign({}, HOLD30, { v: [
        { from: 7, gate: 'g1', ex: 'leg_press', sets: 3, reps: '15', time: null, rest: 90, cat: 'knee', rir: null, note: 'Week 7 light, then one plate more each week. To a 90° bend.' },
        { from: 8, gate: 'g1', ex: 'leg_press', sets: 3, reps: '12', time: null, rest: 90, cat: 'knee', rir: null, note: 'One plate more than last week. To a 90° bend.' },
        { from: 9, gate: 'g1', ex: 'leg_press', sets: 3, reps: '10', time: null, rest: 90, cat: 'knee', rir: null, note: 'One plate more each week. To a 90° bend.' }] })),
      I('D1', 'seated_leg_curl', 3, '10', 0, { cat: 'knee', tech: 'Last set + 5 lengthened partials', techGate: 'g2' }),
      I('D2', 'sl_leg_ext', 2, '15', 60, { cat: 'knee', side: true, note: 'Full range, right then left' }),
      I('E1', 'cable_abd', 3, '15', 0, { cat: 'hip', side: true }), I('E2', 'calf_raise', 3, '12', 45, { cat: 'hip' }),
      GLUTE_PUMP,
    ] },
    lowerB: { title: 'Lower B', sub: 'Hinge + glutes', dur: '60–70 min', ramp: 'lower', core: 'B', hero: 'bb_rdl', items: [
      I('A', 'bb_rdl', 4, '8', 150, { cat: 'hip', restLabel: '2–3 min', note: 'Barbell RDL (back clear) or a light trap-bar deadlift. If your legs feel heavy this morning, skip the top set and do the hip thrusts and accessories.',
        v: [{ from: 9, gate: ['g2', 'bc'], ex: 'conv_deadlift', sets: 3, reps: '6', scheme: 'top', topReps: '5', topRIR: '2', backPct: 12, cat: 'knee', note: 'Gate 2 + back clear: reset every rep' },
          { from: 11, gate: ['g2', 'bc'], ex: 'conv_deadlift', sets: 4, reps: '4', scheme: null, rir: '1', peakLift: true, cat: 'knee', note: 'Peak: 4 × 4, reset every rep' }] }),
      I('B', 'spanish_squat', 3, '', 60, Object.assign({}, HOLD30, { v: [
        { from: 7, gate: 'g1', ex: 'bw_split_squat', sets: 3, reps: '8', time: null, rest: 90, cat: 'knee', rir: null, side: true, note: 'Bodyweight' },
        { from: 8, gate: 'g1', ex: 'offset_rev_lunge', sets: 3, reps: '8', time: null, rest: 90, cat: 'knee', rir: null, side: true, note: 'Slow' },
        { from: 9, gate: 'g2', ex: 'bulgarian', sets: 3, reps: '10', time: null, rest: 90, cat: 'knee', rir: null, side: true, note: 'Gate 2: loaded, torso leaned forward' }] })),
      I('C', 'reverse_hyper', 3, '15', 75, { cat: 'hip', note: '1 s squeeze. Back clear only; otherwise glute bridge hold 3 × 30 s', altRx: { glute_bridge_hold: { reps: '', time: 30 } } }),
      I('D1', 'sl_db_hip_thrust', 3, '12', 0, { cat: 'hip', side: true }), I('D2', 'cable_kickback', 3, '12', 0, { cat: 'hip', side: true }), I('D3', 'hip_abd', 3, '15', 45, { cat: 'hip', note: '45° lean' }),
      I('E', 'step_up', 2, '10', 60, { cat: 'knee', side: true, skip: true, v: [{ from: 8, gate: 'g1', skip: false }], note: 'From Week 8, to knee height' }),
      I('F', 'seated_calf', 3, '15', 45, { cat: 'hip' }),
      GLUTE_PUMP,
    ] },
    push: { title: 'Push', sub: 'Upper C', dur: '55–60 min', ramp: 'upper', core: 'C', hero: 'incline_bb_bench', items: [
      I('A', 'incline_bb_bench', 3, '8', 120, { cat: 'up', scheme: 'top', topReps: '4–6', topRIR: '1', backPct: 10, note: 'Controlled, no bounce' }),
      I('B', 'ohp', 4, '6', 90, { cat: 'up', note: 'Standing barbell press once your back is clear, otherwise seated DB press' }),
      I('C', 'machine_chest_press', 3, '10', 75, { cat: 'up', tech: 'Drop set on the last set' }),
      I('D1', 'cable_lateral', 3, '20', 0, { cat: 'up', side: true }), I('D2', 'hl_crossover', 3, '15', 45, { cat: 'up' }),
      I('E1', 'oh_cable_tri', 3, '12', 0, { cat: 'up', tech: 'Last set: myo-reps' }), I('E2', 'rope_pushdown', 3, '15', 45, { cat: 'up', tech: 'Last set: drop set' }),
    ].concat(ARM_PUMP('oh_cable_tri', 'rope_pushdown')) },
  };

  /* Saturday Knee Lab (Weeks 1–4, and while Gate A is not passed) and Lower B Lite (Week 5+ once Gate A passes) */
  const LAB = {
    lab12: { title: 'Knee Lab', sub: 'Weeks 1–2 version · a strength session for the knee', dur: '35–45 min', ramp: 'lower', core: null, hero: 'sl_leg_ext', lab: true, items: [
      I('A', 'bike_easy', 1, '', 0, { cat: 'lab', time: 480, timeLabel: '8 min', note: 'Arm bike if pedalling hurts' }),
      I('B', 'iso_leg_ext', 5, '', 60, { cat: 'lab', time: 45, note: 'Right leg, held at a 60° bend, ~70% effort' }),
      I('C', 'sl_leg_ext', 3, '12', 60, { cat: 'lab', side: true, note: '90° to 45° range, 3 s down, right then left' }),
      I('D', 'wall_sit', 4, '', 60, { cat: 'lab', time: 40, timeLabel: '30–45 s', note: "At this week's angle ({angle}), weight in the heels" }),
      I('E1', 'sl_leg_curl', 3, '12', 0, { cat: 'lab', side: true, note: 'Right then left' }), I('E2', 'lateral_walk', 2, '15 steps each way', 45, { cat: 'lab', note: 'Band above the knees' }),
      I('F1', 'sl_calf_raise', 3, '12', 0, { cat: 'lab', side: true, note: '2 s pause at the bottom' }), I('F2', 'sl_glute_bridge', 2, '12', 45, { cat: 'lab', side: true, note: 'Right then left' }),
    ] },
    lab34: { title: 'Knee Lab', sub: 'Weeks 3–4 version · a strength session for the knee', dur: '35–45 min', ramp: 'lower', core: null, hero: 'spanish_squat', lab: true, items: [
      I('A', 'bike_easy', 1, '', 0, { cat: 'lab', time: 480, timeLabel: '8 min', note: 'Easy bike or arm bike' }),
      I('B', 'spanish_squat', 5, '', 60, { cat: 'lab', time: 45, note: "Band round a rack behind both knees, sit back to this week's angle ({angle})" }),
      I('C', 'sl_leg_ext', 3, '12', 60, { cat: 'lab', side: true, note: '90° to 45° range until Gate 1 (the plan’s 30° waits), 3 s down' }),
      I('D', 'step_down', 3, '10', 60, { cat: 'lab', note: 'From a 4-in step, right leg, knee over the 2nd toe' }),
      I('E1', 'sl_leg_curl', 3, '12', 0, { cat: 'lab', side: true }), I('E2', 'balance_toss', 3, '', 45, { cat: 'lab', time: 30 }),
      I('F1', 'sl_rdl_reach', 2, '8', 0, { cat: 'lab', side: true, backSkip: 2, note: 'Skip if the back is above 2' }), I('F2', 'sl_calf_raise', 3, '12', 45, { cat: 'lab', side: true }),
    ] },
    lite: { title: 'Lower B Lite', sub: 'Second lower day · Gate A passed', dur: '50–60 min', ramp: 'lower', core: 'B', hero: 'sl_db_hip_thrust', items: [
      I('A', 'bb_rdl', 3, '12', 90, { cat: 'hip', alt: 'pull_through', note: 'Cable pull-through; barbell RDL once your back is clear' }),
      I('B', 'spanish_squat', 4, '', 60, { cat: 'knee', time: 45, rir: '3', note: 'At a 90° bend' }),
      I('C', 'step_down', 3, '10', 60, { cat: 'knee', side: true, note: 'Right then left. 4-in step until Gate 1 (the plan’s 6-in step waits)' }),
      I('D1', 'sl_db_hip_thrust', 3, '12', 0, { cat: 'hip', side: true }), I('D2', 'sl_leg_ext', 3, '12', 60, { cat: 'knee', side: true, note: '90° to 45° range until Gate 1' }),
      I('E1', 'sl_leg_curl', 3, '12', 0, { cat: 'knee', side: true }), I('E2', 'hip_abd', 3, '15', 45, { cat: 'hip', note: '45° forward lean' }),
      I('F', 'sl_calf_raise', 3, '12', 45, { cat: 'hip', side: true }),
    ] },
  };
  /* Knee Lab angle ladder: knee bend for wall sits and Spanish squats */
  const ANGLES = { 1: '30°', 2: '45°', 3: '60°', 4: '60–75°', 5: '90°', 6: '90°' };

  /* Minimum Viable Week, taper and Sri Lanka sessions */
  const MIN = {
    minA: { title: 'Full-body A', sub: 'Minimum session · 30 min', dur: '30 min', ramp: null, core: null, hero: 'hip_thrust', items: [
      I('A', 'hip_thrust', 3, '10', 60, { cat: 'hip' }), I('B', 'pullup', 3, '8', 60, { cat: 'up', note: 'Pull-up or pulldown' }),
      I('C', 'seated_leg_curl', 3, '12', 60, { cat: 'knee' }), I('D', 'db_bench', 3, '10', 60, { cat: 'up' }),
      I('E', 'hip_abd', 2, '15', 45, { cat: 'hip' }), I('F', 'dead_bug', 2, '8', 45, { side: true }),
    ] },
    minB: { title: 'Full-body B', sub: 'Minimum session · 30 min', dur: '30 min', ramp: null, core: null, hero: 'incline_db', items: [
      I('A', 'bb_rdl', 3, '8', 60, { cat: 'hip', note: 'RDL: barbell once your back is clear, otherwise DB' }), I('B', 'incline_db', 3, '10', 60, { cat: 'up' }),
      I('C', 'spanish_squat', 3, '', 60, { cat: 'knee', time: 30, note: 'Split squat once Gate 1 has passed; Spanish squat hold until then', v: [{ from: 0, gate: 'g1', ex: 'split_squat', time: null, reps: '8', side: true, note: 'Gate 1 passed: split squat' }] }),
      I('D', 'cs_db_row', 3, '10', 60, { cat: 'up' }), I('E', 'oh_cable_tri', 2, '12', 45, { cat: 'up' }),
      I('F', 'suitcase_carry', 2, '', 45, { dist: '40 steps', side: true, backSkip: 2 }),
    ] },
    taperFull: { title: 'Full-body pump', sub: 'Taper', dur: '45 min', ramp: 'upper', core: 'A', hero: 'hip_thrust', items: [
      I('A', 'pullup', 2, '12–15', 45, { rir: '2' }), I('B', 'incline_db', 2, '12–15', 45, { rir: '2' }), I('C', 'cable_row_1arm', 2, '12–15', 45, { rir: '2', side: true }),
      I('D', 'hip_thrust', 2, '12–15', 45, { rir: '2' }),
      I('E', 'spanish_squat', 2, '', 45, { time: 30, rir: '2', note: 'Goblet squat once Gate 1 has passed; Spanish squat hold until then', v: [{ from: 0, gate: 'g1', ex: 'goblet_squat', time: null, reps: '12–15' }] }),
      I('F', 'bb_rdl', 2, '12–15', 45, { rir: '2' }), I('G', 'oh_cable_tri', 2, '12–15', 45, { rir: '2' }), I('H', 'ez_curl', 2, '12–15', 45, { rir: '2' }),
    ] },
    taperPump: { title: 'Glute and arm pump', sub: 'Taper · then photos', dur: '35 min', ramp: 'lower', core: null, hero: 'hip_thrust', items: [
      I('A', 'hip_thrust', 3, '15', 45, { rir: '2' }),
      I('B1', 'cable_kickback', 3, '15', 0, { rir: '2', side: true }), I('B2', 'hip_abd', 3, '15', 45, { rir: '2' }),
      I('C1', 'ez_curl', 3, '15', 0, { rir: '2' }), I('C2', 'rope_pushdown', 3, '15', 45, { rir: '2' }),
    ] },
  };

  /* ---------------------------------------------------------- Polo Day (Fridays)
     Knee- and back-safe conditioning. Jumps and sprints only once gated; Fridays stay jump-free. */
  const POLO_WARM = 'Warm-up 6 min: easy arm bike or ski erg, band pull-aparts, arm circles, glute bridges.';
  const POOL_1 = 'Pool version: 300 m easy, 10 × 50 m hard freestyle with a pull buoy on 30 s rest, 6 × 25 m all-out with the buoy on 45 s, 200 m easy. Flutter kick only, open turns.';
  const POOL_2 = 'Pool version: 400 m warm-up, 3 × (4 × 50 m fast freestyle with the buoy on 15 s + 100 m easy), 200 m easy. Flutter kick only, open turns.';
  const POOL_3 = 'Pool version: 400 m warm-up, 3 × (4 × 50 m fast freestyle on 15 s + 100 m easy), 200 m easy. Open turns until Gate 3; breaststroke and eggbeater only after Gate 4.';
  const CIRC_12 = { name: 'Circuit × 4', kind: 'circuit', rounds: 4, rest: 75, restLabel: '60–75 s between rounds', items: [
    { ex: 'battle_ropes', label: '30 s' }, { ex: 'pushup', label: '× 10' }, { ex: 'farmer', label: '40 m, moderate' }, { ex: 'band_pull_apart', label: '× 20' }, { ex: 'dead_bug', label: '× 8 per side' }] };
  const CIRC_34 = { name: 'Circuit × 4', kind: 'circuit', rounds: 4, rest: 75, restLabel: '60–75 s between rounds', items: [
    { ex: 'farmer', label: '40 m, heavy' }, { ex: 'pushup', label: '× 12' }, { ex: 'battle_ropes', label: '30 s' }, { ex: 'bear_taps', label: '× 16' }, { ex: 'kb_swing', label: '× 15' }] };
  const CIRC_78 = { name: 'Circuit × 4', kind: 'circuit', rounds: 4, rest: 75, restLabel: '75 s between rounds', items: [
    { ex: 'sled_push', label: '20 m, light to moderate' }, { ex: 'kb_swing', label: '× 15' }, { ex: 'burpee_step', label: '× 8, no jump' }, { ex: 'farmer', label: '40 m' }, { ex: 'hanging_knee_raise', label: '× 10' }] };
  const CORE_12 = { name: 'Core', kind: 'sets', rounds: 2, rest: 45, items: [{ ex: 'pallof', label: '2 × 10 per side' }, { ex: 'side_plank', label: '2 × 20 s per side' }] };
  const CORE_34 = { name: 'Core', kind: 'sets', rounds: 2, rest: 45, items: [{ ex: 'pallof', label: '2 × 10 per side' }, { ex: 'hollow_hold', label: '2 × 30 s' }] };
  const DEEP_END = (min, bench) => ({ name: 'The Deep End', kind: 'amrap', minutes: min, benchmark: bench || null, label: min + '-min AMRAP. Log your rounds.', items: [
    { ex: 'rower', label: '12 cal (ski erg until Gate 2)' }, { ex: 'kb_swing', label: '× 15' }, { ex: 'burpee_step', label: '× 8' }, { ex: 'sled_push', label: '20 m' }, { ex: 'hanging_knee_raise', label: '× 10' }] });
  const SPEED = (n) => ({ name: 'Speed', kind: 'interval', ex: 'assault_bike', rounds: n, work: 15, restI: 75, label: 'Assault bike or ski erg ' + n + ' × 15 s all-out / 75 s easy' });
  const POLO = {
    1: { sub: 'Knee- and back-safe conditioning', pool: POOL_1, blocks: [
      { name: 'Engine', kind: 'efforts', ex: 'ski_erg', reps: 8, dist: '250 m', rest: 60, label: 'Ski erg 8 × 250 m, log your average split · 60 s between efforts · arm bike if the back is above 2' }, CIRC_12, CORE_12] },
    2: { sub: 'Knee- and back-safe conditioning', pool: POOL_1, blocks: [
      { name: 'Engine', kind: 'interval', ex: 'ski_erg', rounds: 10, work: 30, restI: 60, label: 'Arm bike or ski erg 10 × (30 s hard / 60 s easy) · arm bike if the back is above 2' }, CIRC_12, CORE_12] },
    3: { sub: 'Knee- and back-safe conditioning', pool: POOL_2, blocks: [
      { name: 'Engine', kind: 'efforts', ex: 'ski_erg', reps: 6, dist: '500 m', rest: 90, label: 'Ski erg 6 × 500 m · 90 s between efforts' }, CIRC_34, CORE_34] },
    4: { sub: 'Knee- and back-safe conditioning', pool: POOL_2, blocks: [
      { name: 'Engine', kind: 'interval', ex: 'assault_bike', rounds: 10, work: 20, restI: 70, label: 'Assault bike 10 × (20 s hard / 70 s easy) if pedalling has been pain-free, else ski erg' }, CIRC_34, CORE_34] },
    5: { sub: '20-min EMOM · the whole session', pool: POOL_2, blocks: [
      { name: '20-min EMOM', kind: 'emom', minutes: 20, odd: { ex: 'ski_erg', label: '12 cal ski erg' }, even: { ex: 'battle_ropes', label: '30 s battle ropes + 10 push-ups' }, label: "Odd minutes 12 cal ski erg, even minutes 30 s battle ropes + 10 push-ups. That's the whole session." }] },
    7: { sub: 'Speed and circuit · easy on the legs', pool: POOL_3, blocks: [SPEED(8), CIRC_78] },
    8: { sub: 'Speed and circuit · easy on the legs', pool: POOL_3, blocks: [SPEED(8), CIRC_78] },
    9: { sub: 'The Deep End · your benchmark', pool: POOL_3, blocks: [DEEP_END(15, 'deepend')] },
    10: { sub: 'Christmas morning, optional · about 10 min', pool: null, optional: true, blocks: [DEEP_END(10), SPEED(6)] },
    11: { sub: 'Speed and circuit · jump-free', pool: POOL_3, blocks: [SPEED(8), CIRC_78] },
    12: { sub: 'Knee strength index, then The Deep End retest', pool: null, blocks: [DEEP_END(15, 'deepend')] },
  };
  const TURKEY = { title: 'Turkey Burner', sub: 'Thanksgiving morning with Nadun', dur: '~35 min', hero: 'ski_erg', warmup: 'Warm-up 5 min.',
    blocks: [{ name: '20-min AMRAP at a steady RPE 7', kind: 'amrap', minutes: 20, label: 'Steady RPE 7, not a race.', items: [
      { ex: 'ski_erg', label: '12 cal' }, { ex: 'pushup', label: '× 10' }, { ex: 'banded_bridge', label: '× 15' }, { ex: 'dead_bug', label: '× 8 per side' }] }],
    cooldown: 'Walk 10–15 min after the big meal.' };

  /* ------------------------------------------------------------- core finishers
     Keyed by week (the Core Code's phase names disagree with the training phases):
     Weeks 1–3 control, 4–6 load, 7–13 shred. Order: lower abs, obliques, upper abs, deep hold. */
  const CORE = {
    1: { A: ['reverse_crunch', 'dead_bug', 'heel_taps', 'body_saw', 'hollow_tuck'],
         B: ['side_plank_l', 'side_plank_r', 'pallof_l', 'pallof_r', 'bird_dog_core'],
         C: ['ball_crunch', 'ball_rollout', 'glute_bridge_march', 'bear_taps', 'vacuum'] },
    2: { A: ['hanging_knee_raise', 'rc_hip_lift', 'ab_wheel', 'weighted_dead_bug', 'hollow_ext'],
         B: ['cable_chop_l', 'cable_chop_r', 'suitcase_march', 'side_plank_dips', 'bicycle'],
         C: ['rope_crunch', 'plate_crunch', 'long_plank', 'tuck_vsit', 'vacuum'] },
    3: { A: ['hlr_straight', 'hang_oblique', 'ab_wheel_full', 'dragon_flag', 'hollow_rock'],
         B: ['landmine_rainbow', 'cable_lift', 'side_plank_leg', 'pallof_hold', 'heavy_suitcase'],
         C: ['weighted_rope_crunch', 'vup', 'stir_pot', 'long_plank', 'vacuum'] },
  };
  const CORE_NAMES = { A: 'Core A · lower abs + anti-extension', B: 'Core B · obliques + anti-rotation', C: 'Core C · upper abs + deep hold' };
  /* week → [work s, rest s, rounds, last interval to failure] */
  const CORE_FMT = { 1: [30, 15, 1], 2: [30, 15, 2], 3: [30, 15, 2], 4: [40, 20, 2], 5: [40, 20, 2], 6: [40, 20, 1], 7: [45, 15, 2], 8: [45, 15, 2], 9: [45, 15, 2], 10: [45, 15, 1], 11: [50, 10, 2, true], 12: [50, 10, 2, true], 13: [40, 20, 1] };

  /* ------------------------------------------------------------------ routines */
  const R = (ex, dose, more) => Object.assign({ ex, dose }, more || {});
  const ROUTINES = {
    kneeArmor: { title: 'Knee Armor', sub: 'Daily through Week 6, then Mon, Wed, Fri', min: 10, hero: 'quad_set', steps: [
      R('quad_set', '10 × 5 s', { holds: 10, hold: 5 }),
      R('slr', '3 × 12', { reps: 12, sets: 3 }),
      R('tke', '2 × 15, 2 s squeeze', { reps: 15, sets: 2 }),
      R('balance_alpha', '3 rounds A to Z', { reps: 3, alpha: true }),
      R('hip_lift', '2 × 12 per side', { reps: 12, sets: 2, side: true }),
      R('heel_slide', '10 reps, only while the right knee bends less than the left', { reps: 10, optional: true }),
    ] },
    backReset: { title: 'Back Reset', sub: 'Every morning until back clear, then 3 times a week', min: 5, hero: 'cat_camel', steps: [
      R('cat_camel', '8 reps', { reps: 8 }),
      R('curl_up', '5 × 8 s', { holds: 5, hold: 8 }),
      R('side_plank_knee', '3 × 10–15 s per side', { time: 12, sets: 3, side: true }),
      R('bird_dog', '8 s holds, 5 per side', { holds: 5, hold: 8, side: true }),
      R('hip_flexor_stand', '2 × 30 s per side', { time: 30, sets: 2, side: true }),
    ] },
    deepcore: { title: 'Deep Core', sub: 'Inner abs, every morning after Knee Armor', min: 4, hero: 'vacuum', steps: [
      R('croc_breath', '5 breaths', { breaths: 5, inS: 4, outS: 6 }),
      R('draw_in', '5 × 10 s', { holds: 5, hold: 10 }),
      R('vacuum', 'vacuum', { holds: 3, hold: 20, vacuum: true }),
      R('pelvic_lift', '10 × 5 s', { holds: 10, hold: 5 }),
      R('hollow_body', '3 × 15–30 s', { time: 20, sets: 3 }),
    ] },
    ramp_upper: { title: 'Ramp · Mon and Thu', sub: '6–8 min before Pull and Push', min: 7, hero: 'band_pull_apart', steps: [
      R('band_pull_apart', '× 20', { reps: 20 }), R('band_er', '× 15 per side', { reps: 15, side: true }),
      R('scap_pushup', '× 10', { reps: 10 }), R('scap_pullup', '× 10', { reps: 10 }), R('thoracic_ext', '× 8', { reps: 8 }),
    ] },
    ramp_lower: { title: 'Ramp · Tue and Sat', sub: '6–8 min before the lower session', min: 8, hero: 'lateral_walk', steps: [
      R('bike_easy', '4 min, easy (arm bike if pedalling hurts)', { time: 240 }),
      R('cat_camel', '× 6', { reps: 6 }), R('hip_switch', '× 8 each way', { reps: 8 }),
      R('lateral_walk', '× 15 steps each way', { reps: 15 }), R('glute_bridge', '× 15', { reps: 15 }), R('tke', '× 15, right', { reps: 15 }),
      R('stand_up', 'Then ramp-up sets on lift 1: bar × 10 → 50% × 5 → 70% × 3 → 85% × 1', { reps: 4 }),
    ] },
    mobility: { title: 'Easy mobility', sub: '10 min · Wednesdays', min: 10, hero: 'hip_switch', steps: [
      R('cat_camel', '8 slow reps', { reps: 8 }), R('hip_switch', '8 each way', { reps: 8 }),
      R('quad_stretch', '2 × 30 s per side', { time: 30, sets: 2, side: true }), R('hip_flexor_stand', '2 × 30 s per side', { time: 30, sets: 2, side: true }),
    ] },
    desk: { title: 'Desk reset', sub: 'If you sit for work · every 60 min · 1 min', min: 1, hero: 'cat_camel', steps: [
      R('stand_up', 'Stand up', { reps: 1 }), R('cat_camel', '5 cat-camels', { reps: 5 }), R('glute_squeeze', 'A few glute squeezes', { reps: 5 }),
    ] },
  };

  /* ---------------------------------------------------------------- calendar */
  const PHASES = [
    { n: 1, name: 'Protect', weeks: [1, 2], color: 'var(--train)', focus: 'One lower day + Knee Lab; upper body RIR 2, then 1–2' },
    { n: 2, name: 'Rebuild', weeks: [3, 4, 5, 6], color: 'var(--train)', focus: 'Hips heavy again; Gate A Nov 14; Week 6 Pivot deload, Gate 1 Nov 28' },
    { n: 3, name: 'Reload Legs', weeks: [7, 8, 9, 10], color: 'var(--train)', focus: 'Squats and lunges back light; Gate 2 from Dec 14; Week 10 Holiday Express' },
    { n: 4, name: 'Peak', weeks: [11, 12], color: 'var(--train)', focus: 'Heaviest legs, light jumps if Gate 3 passed, final retest Jan 4–10' },
    { n: 5, name: 'Taper', weeks: [13], color: 'var(--train)', focus: 'Pump sessions, walks, packing' },
  ];
  const WEEKS = {
    1: { focus: 'One lower day at RIR 3–4 + Knee Lab; the back settles. Upper A at RIR 2', rir: 'Up 2 · Hips 3–4' },
    2: { focus: 'Same, loads up slightly. Upper A at RIR 1–2', rir: 'Up 1–2 · Hips 3', event: 'Halloween Sat' },
    3: { focus: 'Hip work heavier (RIR 2); deeper Knee Lab holds. Upper B', rir: 'Up 1–2 · Hips 2' },
    4: { focus: 'Gate A test Sat Nov 14. Upper B', rir: 'Up 1–2 · Hips 2' },
    5: { focus: 'Second lower day (Lower B Lite) if Gate A passed. Upper B', rir: 'Up 1–2 · Hips 2' },
    6: { focus: 'Pivot deload: ~60% of the sets, same loads, stop at RIR 3. Gate 1 test Sat Nov 28', rir: '3', event: 'Thanksgiving Thu Nov 26', label: 'Pivot' },
    7: { focus: 'Squats, split squats and leg press back with little or no weight. Upper C', rir: 'Up 1–2 · Hips 1 · Knee 2+' },
    8: { focus: 'Loads build each week. Upper C', rir: 'Up 1–2 · Hips 1 · Knee 2+', event: 'Holiday parties start' },
    9: { focus: 'Gate 2 test Mon Dec 14: heavy squat and deadlift top sets. Upper C', rir: 'Up 1–2 · Hips 1' },
    10: { focus: 'Holiday Express: ⅔ of the sets, same loads and effort, finishers optional, ~40 min', rir: 'Up 1–2 · Hips 1', event: 'Christmas Fri Dec 25', label: 'Holiday Express' },
    11: { focus: 'Peak: heaviest legs of the block; light jumps only if Gate 3 passed', rir: '1 (2 on legs if Gate 2 came late)', event: "New Year's Eve Thu Dec 31" },
    12: { focus: 'Final retest Jan 4–10', rir: '1' },
    13: { focus: 'Taper: pump sessions, walks, packing', rir: '2', event: 'Fly Fri Jan 15', label: 'Taper' },
  };
  /* Barbell hip thrust 8RM test: Week 3 Tuesday top set (see Plan decisions.md) */
  const HT_TEST_WEEK = 3;

  /* Knee gates: each opens on a logged test, on or after its earliest date, and only
     2+ weeks after the previous gate passed with no flare. Index = right ÷ left. */
  const KNEE_GATES = [
    { id: 'gA', lvl: 1, n: 'Gate A', what: 'Second lower day', earliest: '2026-11-14', dow: 5,
      crit: ['No swelling for 7 days (morning stroke test 0)', 'Knee ≤2/10 during Tuesday’s session and the next morning, 2 weeks running', 'Wall sit at a 60° bend, 3 × 45 s, pain-free', '10 slow step-downs from a 4-in step, knee over the 2nd toe', 'Quad index ≥70% (single-leg leg extension 10RM, right ÷ left)'],
      then: 'Saturday becomes Lower B Lite' },
    { id: 'g1', lvl: 2, n: 'Gate 1', what: 'Squats, light', earliest: '2026-11-28', dow: 5,
      crit: ['Gate A for 2 weeks with no flare', 'Spanish squat hold at a 90° bend, 3 × 30 s, pain-free', '10 bodyweight box squats to knee height at ≤2/10', 'Quad index ≥75%'],
      then: 'Goblet box squat, leg press to a 90° bend, bodyweight split squat, reverse lunge, step-ups to knee height, all with little or no weight; trap-bar deadlift if back clear' },
    { id: 'g2', lvl: 3, n: 'Gate 2', what: 'Heavy legs', earliest: '2026-12-14', dow: 0,
      crit: ['Gate 1 for 2 weeks with no flare', 'Quad index ≥85%', '10 single-leg box squats to a 60° bend, clean', 'Back clear (morning stiffness 0 for 7 straight days)'],
      then: 'Low-bar back squat and conventional deadlift top sets, loaded Bulgarian split squats, deficit reverse lunges, deep hack or belt squat' },
    { id: 'g3', lvl: 4, n: 'Gate 3', what: 'Jumps', earliest: '2026-12-28', dow: 0, planDate: 'Sat Dec 26',
      crit: ['Gate 2 for 2 weeks with no flare', 'Quad, hamstring and glute index ≥85%', 'Your PT agrees'],
      then: 'Pogos, box jumps (step down), bodyweight jump squats, walk-jog intervals, bike sprints' },
    { id: 'g4', lvl: 5, n: 'Gate 4', what: 'Side to side', earliest: '2027-01-15', dow: 5, planDate: 'Sri Lanka, mid-January at the earliest',
      crit: ['Gate 3 for 2 weeks', 'Index ≥90%', 'Single-leg hop and triple hop ≥90% of the left', 'Firm, flat ground (not sand); lateral shuffles before bounds'],
      then: 'Lateral bounds, shuffles, cutting, running sprints, eggbeater and breaststroke kick' },
  ];
  const BACK_CLEAR_DAYS = 7;

  /* ---------------------------------------------------------------- nutrition
     Same table as Nadun, your portions (about 80% of his). Macros are estimates for the portions shown. */
  const F = (id, n, kcal, p, c, f, more) => Object.assign({ id, n, kcal, p, c, f }, more || {});
  const FOODS = [
    F('pre_banana', 'Coffee + half a banana', 55, 1, 14, 0, { slot: 'pre', d: 'If you train soon after waking', tone: 'banana' }),
    F('pre_ricecake', 'Coffee + 1 rice cake with honey', 65, 1, 15, 0, { slot: 'pre', d: 'If you train soon after waking', tone: 'banana' }),
    F('bfast', 'Plan breakfast', 250, 35, 6, 8, { slot: 'breakfast', d: '1 egg + ¾ cup egg whites + ½ cup low-fat cottage cheese (~35 g protein)', tone: 'eggs' }),
    F('bfast_fruit', 'Plan breakfast + fruit', 330, 36, 27, 8, { slot: 'breakfast', d: 'Lower-body days: add fruit', tone: 'eggs' }),
    F('shake', 'Whey shake, 1 scoop', 120, 25, 3, 2, { slot: 'post', d: 'Post-workout (~25 g protein). Creatine 3–5 g every day, rest days included', tone: 'shake' }),
    F('lunch_sl', 'Sri Lankan lunch', 600, 52, 64, 14, { slot: 'lunch', d: '4–5 oz chicken, ¾ cup cooked rice, ½ cup dhal, as much vegetable curry or mallung as you like (light coconut milk, 1 tsp oil)', tone: 'curry' }),
    F('lunch_chicken_sand', 'Chicken sandwich or wrap', 380, 45, 30, 8, { slot: 'lunch', d: '4 oz chicken, high-protein bread or wrap, mustard or light mayo', tone: 'sandwich' }),
    F('lunch_tuna_sand', 'Tuna sandwich or wrap', 345, 41, 31, 7, { slot: 'lunch', d: '4 oz tuna, high-protein bread or wrap, mustard or light mayo', tone: 'sandwich' }),
    F('dinner_chicken', 'Chicken, ¾ cup rice + double vegetables', 485, 46, 48, 10, { slot: 'dinner', d: 'Lower-body days: 4–5 oz chicken, ¾ cup rice, double vegetables', tone: 'plate' }),
    F('dinner_beef', '93/7 beef, ¾ cup rice + double vegetables', 535, 40, 48, 18, { slot: 'dinner', d: '4–5 oz 93/7 beef, ¾ cup rice, double vegetables', tone: 'plate' }),
    F('dinner_rest', 'Chicken, ½ cup rice + double vegetables', 435, 45, 37, 10, { slot: 'dinner', d: 'Rest and upper days: ½ cup rice, double vegetables', tone: 'plate' }),
    F('snack_cottage', 'Cottage cheese bowl', 170, 21, 16, 2, { slot: 'snack', d: '¾ cup low-fat cottage cheese + berries + cinnamon', tone: 'bowl' }),
    F('snack_corepower', 'Fairlife Core Power 26 g', 170, 26, 8, 4, { slot: 'snack', d: 'Zero prep', tone: 'shake' }),
    F('snack_icecream', 'Protein ice cream (Ninja Creami)', 170, 26, 8, 4, { slot: 'snack', d: 'A Fairlife shake frozen 24 h, spun in the Creami', tone: 'bowl' }),
    F('snack_casein', 'Casein pudding', 130, 24, 5, 2, { slot: 'snack', d: '1 scoop casein + a splash of milk', tone: 'bowl' }),
    F('snack_omelette', 'Egg-white omelette + salsa', 150, 26, 8, 1, { slot: 'snack', d: '1 cup egg whites + vegetables + salsa', tone: 'eggs' }),
    F('free_meal', 'Free meal', 1050, 40, 110, 50, { slot: 'lunch', d: 'At lunch: 30+ g protein first, then what you want; about 900–1,200 kcal, one sitting, no grazing after', tone: 'free', free: true }),
    F('holiday_plate', 'Holiday plate', 900, 45, 90, 38, { slot: 'dinner', d: 'Protein fills a third of the first plate; one plate of everything you love, then seconds of protein and vegetables (estimate)', tone: 'free' }),
  ];
  const DRINKS = [
    { id: 'wine', n: 'Dry wine, 5 oz', kcal: 125 }, { id: 'beer', n: 'Light beer, 12 oz', kcal: 100 }, { id: 'spirit', n: 'Spirit with soda, 1.5 oz', kcal: 100 },
  ];
  /* drinks: cap 2–3 a night, Friday 1–2, none on Thursday night before Polo Day. No weekly budget in the plan. */
  const DRINK_BUDGET = { night: 3, fri: 2, thu: 0 };
  const FREE_MEALS = { normal: 2 };
  const PROTEIN = [140, 145];
  const KCAL = { weekday: 1900, weekend: 2150, bigDay: 2250, energyFloor: 2200, taperAdd: 300 };
  const SUPPS = [
    { id: 'creatine', n: 'Creatine 3–5 g', d: 'Every day, rest days included (the first-week scale bump is water in the muscle)' },
    { id: 'vitd', n: 'Vitamin D3 1,000–2,000 IU', d: 'November to January (weak Pittsburgh sun); ideally check your level', months: [11, 12, 1] },
    { id: 'fishoil', n: 'Fish oil 1–2 g EPA + DHA', d: 'Optional', optional: true },
    { id: 'mag', n: 'Magnesium glycinate 200–300 mg', d: 'Evening, if sleep is poor', optional: true },
  ];
  const SLOTS = [
    { id: 'pre', n: 'Pre-workout' }, { id: 'breakfast', n: 'Breakfast' }, { id: 'post', n: 'Post-workout' },
    { id: 'lunch', n: 'Lunch' }, { id: 'dinner', n: 'Dinner' }, { id: 'snack', n: 'Evening snack' },
  ];
  const GUIDES = [
    { id: 'targets', t: 'Your daily targets', tone: 'plate', body: [
      'Mon–Thu about 1,900 kcal; Fri–Sun about 2,150. Average about 2,000 a day (14,000 a week).',
      'Protein 125–145 g every day (about 2–2.3 g per kg), in doses of 20–40 g every 3–4 hours.',
      'Fat 55–65 g Mon–Thu, 65–80 g Fri–Sun. Carbs about 200 g Mon–Thu, about 240 g Fri–Sun. Fiber 25–35 g.',
      'Water 2.5–3 L; electrolytes on Polo Day.',
      'Maintenance is roughly 2,150–2,350 a day, so this is a small, deliberate deficit: you are already lean and training hard.',
      'Track for the first 2 weeks to calibrate, then eyeball portions and track again if two weeks stall.'] },
    { id: 'plate', t: 'Same table as Nadun, your portions', tone: 'curry', body: [
      'You eat the same meals as Nadun at roughly 80% of his portions.',
      'Breakfast: 1 egg + ¾ cup egg whites + ½ cup low-fat cottage cheese (~35 g protein); fruit on lower-body days.',
      'Sri Lankan lunch: 4–5 oz chicken, ¾ cup cooked rice, ½ cup dhal, as much vegetable curry or mallung as you like.',
      'Sandwich days: 4 oz chicken or tuna, high-protein bread or wrap, mustard or light mayo.',
      'Dinner: 4–5 oz chicken or 93/7 beef, ½–¾ cup rice (¾ on lower-body days, ½ on rest days), double vegetables.',
      'Post-workout: 1 scoop whey (~25 g protein). Pre-workout if you train soon after waking: coffee + half a banana or 1 rice cake with honey.'] },
    { id: 'srilankan', t: 'Sri Lankan cooking', tone: 'curry', body: [
      'The hidden calories in the shared cooking are coconut milk and tempering oil.',
      'Use light coconut milk or half milk, and measure oil at 1 tsp per serving.',
      'Coconut sambol and fried papadum are extras, not sides.',
      'Dhal counts as carbs more than protein.'] },
    { id: 'snack', t: 'Evening protein snack', tone: 'bowl', body: [
      '25–35 g protein, 1–2 h before bed: slow protein supports overnight muscle repair.',
      'Cottage cheese bowl (¾ cup low-fat + berries + cinnamon): 21 g, ~170 kcal.',
      'Fairlife Core Power 26 g shake: 26 g, ~170 kcal.',
      'Protein ice cream (a Fairlife shake frozen 24 h, spun in a Ninja Creami): 26 g, ~170 kcal.',
      'Casein pudding (1 scoop casein + a splash of milk): 24 g, ~130 kcal.',
      'Egg-white omelette (1 cup whites) + vegetables + salsa: 26 g, ~150 kcal.',
      'Calories are approximate; check your labels.'] },
    { id: 'free', t: 'Free meals', tone: 'free', body: [
      'Two a week, at lunch.', '30+ g of protein first, then eat what you want.', 'About 900–1,200 kcal in one sitting, no grazing after.', 'The next meal is normal.'] },
    { id: 'drinks', t: 'Drinks', tone: 'drink', body: [
      'About 100–125 kcal each: 5 oz dry wine, 12 oz light beer, or 1.5 oz spirit with soda.',
      'Cap 2–3 a night, water between each, last drink 3 h before bed.',
      'Keep Friday to 1–2 so Saturday’s lower session stays strong.',
      'None on Thursday night before Friday’s Polo Day.',
      "New Year's Eve: Push in the morning, a walk in the afternoon, then these drink rules."] },
    { id: 'holiday', t: 'Holiday playbook', tone: 'free', body: [
      'Train the morning of every big day: the Turkey Burner on Thanksgiving, Push on Christmas Eve and New Year’s Eve.',
      'Protein fills a third of the first plate.', 'One plate of everything you love, then seconds of protein and vegetables.',
      'One dessert, eaten slowly.', 'Walk 10–15 min after.',
      'Big days run at about maintenance (~2,250), and the next day is normal: no fasting, no punishment cardio.'] },
    { id: 'calib', t: 'Calibration rule', tone: 'plate', body: [
      'Sundays, compare 7-day average weights.',
      'Losing 0.3–0.6 lb a week: change nothing.',
      'Under 0.25 lb a week for 2 weeks: cut 100 kcal a day (carbs or fat, never protein) or add 2,000 steps a day.',
      'Over 0.8 lb a week for 2 weeks: add 150 kcal a day of carbs. Faster costs glute muscle.',
      'Ignore Week 1 and the weeks after Thanksgiving and Christmas: that is water.',
      'Energy check overrides the scale: a late or missed period, constant fatigue, poor sleep or nagging little injuries mean too little fuel. Go back up to about 2,200 a day and tell your doctor.'] },
    { id: 'supps', t: 'Supplements and checks', tone: 'shake', body: [
      'Creatine 3–5 g daily. It works in women as in men and does not cause fat gain.', 'Whey, as you have it.',
      'Vitamin D3 1,000–2,000 IU from November to January; ideally check your level.',
      'Ask your doctor to check ferritin and iron: heavy training and periods together are a common cause of low iron and flat sessions.',
      'Optional: fish oil (1–2 g EPA + DHA); magnesium glycinate 200–300 mg in the evening if sleep is poor.',
      'Caffeine before training, none after 2 pm.'] },
    { id: 'cycle', t: 'Your cycle', tone: 'plate', body: [
      'No phase-based programming (the performance evidence is weak).',
      'On rough days use the readiness check: yellow means one set fewer, not a skipped session.',
      'A late or missed period means eat more and tell your doctor (energy check).'] },
    { id: 'taper', t: 'Taper food, Jan 12–14', tone: 'curry', body: [
      'Add about 75–100 g of carbs a day (rice, fruit), bringing you near maintenance.',
      'Salt and water normal. No water cutting: dehydration before a ~20-hour journey looks worse and raises clot risk.'] },
  ];

  /* ---------------------------------------------------------------- mind (ids match audio/tracks.json) */
  const MIND = {
    sigh5: { cat: 'breath', n: 'Cyclic sighing', sub: 'Morning breath, every day', min: 5, art: 'dawn', breath: true, why: 'Inhale through the nose, a second short inhale to top up, then a long slow exhale. 5 min a day for a month lifted mood more than mindfulness (Balban et al., 2023).' },
    physio: { cat: 'breath', n: 'Physiological sigh', sub: 'Before a gate test, a heavy top set or a first jump', min: 1, art: 'spark', breath: true, why: 'Double inhale, long exhale: 2–3 breaths.' },
    box4: { cat: 'breath', n: 'Box breathing', sub: 'Wired and can’t focus', min: 4, art: 'grid', breath: true, why: '4 s in, 4 hold, 4 out, 4 hold. 2–4 minutes.' },
    breath10: { cat: 'med', n: 'Breath focus', sub: 'Count breaths like laps, 1 to 10 · Weeks 1–2', min: 10, art: 'tide' },
    scan12: { cat: 'med', n: 'Body scan', sub: 'Notice the knee and thighs without fixing · Weeks 3–4', min: 12, art: 'dusk' },
    scan15: { cat: 'med', n: 'Body scan', sub: 'Tue, Thu, Sat · Weeks 5–8', min: 15, art: 'dusk' },
    open15: { cat: 'med', n: 'Open awareness', sub: 'Mon, Wed, Fri · Weeks 5–8', min: 15, art: 'sky' },
    metta15: { cat: 'med', n: 'Loving-kindness', sub: 'Sundays · Weeks 5–8', min: 15, art: 'warm' },
    open20: { cat: 'med', n: 'Open awareness', sub: 'Lightly guided · Weeks 9–13', min: 20, art: 'sky' },
    sit30: { cat: 'med', n: 'Sunday long sit', sub: 'Weeks 9–13 · with Nadun if you like', min: 30, art: 'night' },
    nsdr10: { cat: 'sleep', n: 'NSDR', sub: 'Non-sleep deep rest', min: 10, art: 'ocean' },
    nsdr20: { cat: 'sleep', n: 'NSDR, extended', sub: 'Stress 6+ at night or poor sleep', min: 20, art: 'ocean' },
    ground: { cat: 'tool', n: '5-4-3-2-1 grounding', sub: 'Frustration on a knee flare day, racing thoughts', min: 2, art: 'spark' },
    stop: { cat: 'tool', n: 'STOP check', sub: 'Every hour of a busy day', min: 1, art: 'grid' },
    confide3: { cat: 'tool', n: 'Confidence rehearsal', sub: 'Before each gate test and the first jump and lateral sessions', min: 3, art: 'warm', why: 'Seated, eyes closed, after two physiological sighs: picture the movement at full speed, knee over the toes, a quiet landing. Then the real warm-up. The gates, not the imagery, decide.' },
  };
  const MIND_CATS = [
    { id: 'breath', n: 'Breathwork' }, { id: 'med', n: 'Meditations' }, { id: 'sleep', n: 'Sleep & recovery' }, { id: 'tool', n: 'Quick tools' },
  ];
  const MIND_TIPS = [
    'Eat the first three bites of each meal slowly and with full attention; it helps at holiday tables too.',
    'One phone-free walk a week, practising open awareness.',
    'On the first working set of each glute exercise, put all your attention in the glute you are training.',
    'Before bed, write 3 good things from the day (2 min).',
    'In the Sunday Reset, journal 10 minutes: what is weighing on you, and what is in your control.',
    'Morning light: 10 min outside within an hour of waking (a walk counts). Sleep 7.5–9 h, same wake time, screens off 30 min before bed.',
  ];
  const RESEARCH = [
    { f: '5 min a day of cyclic sighing for a month improved mood and lowered breathing rate more than the same time of mindfulness meditation.', s: 'Balban et al., 2023, Cell Reports Medicine', u: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947', m: 'Five minutes moves your mood; do it every morning.' },
    { f: '13 min a day of guided meditation cut anxiety, mood disturbance and fatigue at 8 weeks, but not at 4.', s: 'Basso et al., Behavioural Brain Research', u: 'https://www.psypost.org/daily-meditation-decreases-anxiety-and-improves-cognitive-functioning-in-new-meditators-after-8-weeks/', m: "Don't judge it before week 8 (Dec 13)." },
    { f: 'Across 47 trials (3,515 people): meditation reduces anxiety (0.38), depression (0.30) and pain (0.33).', s: 'Goyal et al., 2014, JAMA Internal Medicine', u: 'https://www.healthday.com/healthpro-news/mental-health/review-suggests-psychological-benefits-of-meditation-683649.html', m: 'A real but moderate effect; consistency drives it.' },
    { f: 'An 8-week MBSR course with 45 min of daily practice matched escitalopram for anxiety disorders in 276 adults.', s: 'Hoge et al., 2023, JAMA Psychiatry', u: 'https://www.aafp.org/afp/2023/0600/poems-mindfulness-stress-reduction', m: 'More practice works for heavier anxiety: a level to grow toward.' },
  ];

  /* Questionnaires (Weeks 1, 6 and 12) */
  const PSS10 = { n: 'PSS-10', full: 'Perceived Stress Scale', lead: 'In the last month, how often have you…', scale: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'],
    q: ['been upset because of something that happened unexpectedly?', 'felt that you were unable to control the important things in your life?', 'felt nervous and stressed?',
      'felt confident about your ability to handle your personal problems?', 'felt that things were going your way?', 'found that you could not cope with all the things that you had to do?',
      'been able to control irritations in your life?', 'felt that you were on top of things?', 'been angered because of things that happened that were outside of your control?',
      'felt difficulties were piling up so high that you could not overcome them?'], reverse: [3, 4, 6, 7],
    band: (s) => s <= 13 ? 'Low stress' : s <= 26 ? 'Moderate stress' : 'High stress' };
  const GAD7 = { n: 'GAD-7', full: 'Generalized Anxiety Disorder 7', lead: 'Over the last 2 weeks, how often have you been bothered by…', scale: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    q: ['Feeling nervous, anxious, or on edge', 'Not being able to stop or control worrying', 'Worrying too much about different things', 'Trouble relaxing',
      'Being so restless that it is hard to sit still', 'Becoming easily annoyed or irritable', 'Feeling afraid, as if something awful might happen'], reverse: [],
    band: (s) => s <= 4 ? 'Minimal' : s <= 9 ? 'Mild' : s <= 14 ? 'Moderate' : 'Severe' };

  /* ------------------------------------------------------------- tracking */
  /* Target weight path (7-day average, lb), read from the plan's chart: [date, target, low, high] */
  const TARGET_PATH = [
    ['2026-10-19', 141, 141, 141], ['2026-11-01', 140.5, 139.5, 141.5], ['2026-11-15', 139.5, 138.5, 140.5], ['2026-11-29', 138.5, 137.5, 139.5],
    ['2026-12-13', 137.5, 136.5, 138.5], ['2026-12-27', 136.5, 135.5, 137.5], ['2027-01-11', 135.5, 134.5, 136.5], ['2027-01-14', 135.5, 135, 136.5],
  ];
  const BENCHMARKS = [
    { id: 'weight', n: 'Body weight', how: '7-day average', unit: 'lb', auto: 'weight', goal: '135–136.5 lb' },
    { id: 'waist', n: 'Waist', how: 'At the navel, relaxed, morning', unit: 'in', goal: '−1 to −1.5 in' },
    { id: 'hips', n: 'Glutes', how: 'Widest point', unit: 'in', goal: 'Hold or +0.5 in' },
    { id: 'thigh', n: 'Upper thigh', how: '2 in below the glute fold', unit: 'in', goal: '−0.5 to −1 in' },
    { id: 'midthigh', n: 'Mid-thigh', how: 'Halfway from hip to knee', unit: 'in' },
    { id: 'legextR', n: 'Leg extension 10RM, right', how: 'Single-leg, 90°–45° range until Gate 1', unit: 'lb' },
    { id: 'legextL', n: 'Leg extension 10RM, left', how: 'Single-leg, same range', unit: 'lb' },
    { id: 'quadIdx', n: 'Quad index', how: 'Right ÷ left leg extension', unit: '%', idx: ['legextR', 'legextL'], goal: '≥75% by Nov 28, ≥90% by Jan 4' },
    { id: 'curlR', n: 'Leg curl 10RM, right', how: 'Single-leg seated', unit: 'lb' },
    { id: 'curlL', n: 'Leg curl 10RM, left', how: 'Single-leg seated', unit: 'lb' },
    { id: 'hamIdx', n: 'Hamstring index', how: 'Right ÷ left leg curl', unit: '%', idx: ['curlR', 'curlL'] },
    { id: 'bridgeR', n: 'Single-leg glute bridge, right', how: 'Max reps', unit: 'reps' },
    { id: 'bridgeL', n: 'Single-leg glute bridge, left', how: 'Max reps', unit: 'reps' },
    { id: 'gluteIdx', n: 'Glute index', how: 'Right ÷ left glute bridge reps', unit: '%', idx: ['bridgeR', 'bridgeL'] },
    { id: 'hopR', n: 'Single-leg hop, right', how: 'Distance · from Gate 3', unit: 'in' },
    { id: 'hopL', n: 'Single-leg hop, left', how: 'Distance · from Gate 3', unit: 'in' },
    { id: 'hopIdx', n: 'Hop index', how: 'Right ÷ left hop distance', unit: '%', idx: ['hopR', 'hopL'], goal: '≥85% by Jan 9' },
    { id: 'hip8', n: 'Barbell hip thrust 8RM', how: 'Week 3 Tuesday top set', unit: 'lb' },
    { id: 'hip5', n: 'Barbell hip thrust 5RM', how: 'Week 12 (Tue Jan 5)', unit: 'lb', goal: '+15–20%' },
    { id: 'squat5', n: 'Back squat 5RM', how: 'From Gate 2 (8RM @ RIR 1 if Gate 2 came late)', unit: 'lb' },
    { id: 'dead5', n: 'Deadlift 5RM', how: 'From Gate 2 + back clear (else RDL 8RM)', unit: 'lb' },
    { id: 'incline8', n: 'Incline DB press 8RM', how: 'Thu Jan 7, before Push', unit: 'lb' },
    { id: 'pullups', n: 'Strict pull-ups', how: 'Dead hang to chin over bar', unit: 'reps', goal: '+2 reps' },
    { id: 'deepend', n: 'The Deep End', how: 'Rounds · first score Week 9', unit: 'rounds' },
    { id: 'sideL', n: 'Side bridge, left', how: 'Elbow, held to form failure', unit: 's', core: true, goal: 'L/R within 5%' },
    { id: 'sideR', n: 'Side bridge, right', how: 'Elbow, held to form failure', unit: 's', core: true },
    { id: 'extensor', n: 'Back extensor (Biering-Sørensen)', how: 'Torso level off the bench · only once back clear', unit: 's', core: true, goal: 'Longer than flexor hold' },
    { id: 'flexor', n: 'Trunk flexor', how: '60° wedge, pulled back 10 cm', unit: 's', core: true, goal: 'Flexor ÷ extensor < 1.0' },
    { id: 'hlr', n: 'Hanging leg raise', how: 'Strict, legs to 90°+, no swing', unit: 'reps', core: true, goal: '+5 reps by Week 12' },
    { id: 'abwheel', n: 'Ab wheel rollout', how: 'Max reps from the knees · only once back clear', unit: 'reps', core: true, goal: '+5 reps by Week 12' },
    { id: 'vacuumMax', n: 'Stomach vacuum', how: 'Max hold, standing', unit: 's', core: true, goal: '60 s by Week 12' },
  ];
  const SUNDAY_RESET = [
    '7-day average weight and waist', 'Sessions done (out of 6) and average steps', 'Protein days hit (out of 7) and average sleep',
    'Knee swelling scores, knee pain after the hardest day, right low-back stiffness', 'Next gate test booked, if one is due',
    'Apply the calibration rule, and the energy check', "Book the week's training times with Nadun; cook protein for Mon–Wed together",
    'Photos (every second Sunday)', 'Write down one win from the week', 'Journal 10 min: what is weighing on you, and what is in your control',
  ];
  const RED_FLAGS = [
    'The kneecap slips out again, or the knee gives way',
    'Locking or catching: the knee gets stuck and has to be wiggled free',
    'Knee swelling that keeps coming back, or a knee that won’t fully straighten',
    'Back pain that spreads into the buttock or down the leg, numbness or tingling, leg weakness',
    'Numbness in the groin or saddle area, or any bladder or bowel change: same day, emergency',
    'Back pain with fever, at night that never eases, or that keeps getting worse',
    'Calf pain, warmth or swelling, especially around the long flight',
  ];
  const SWAPPED = [
    ['Squats, split squats, lunges, leg press, hack squat, step-ups above 4 in', 'Knee Lab angle ladder (isometric holds 30° → 45° → 60° → 90°) until Gate 1'],
    ['Forward and walking lunges', 'Reverse lunges, for the whole block'],
    ['Leg extension, full range', '90° to 45° only until Gate 1 (isometric holds any time); full range after Gate 1'],
    ['Kneeling on the right knee', 'Kneel on the left, use a thick pad, or stand'],
    ['Heavy RDLs, back extensions, KB swings, barbell rows, standing overhead press, ab wheel, loaded rotation', 'Wait for back clear (DB RDL light, cable pull-through, chest-supported rows, seated DB press, dead bugs, Pallof presses)'],
    ['Jumps, sprints, burpees, sled push, thrusters, rowing machine', 'Ski erg, battle ropes, arm bike, swim intervals, carries'],
    ['Assault bike', 'Only if pedalling is pain-free (it bends the knee to roughly 110°); raise the seat'],
    ['Breaststroke and eggbeater kick', 'Flutter kick, pull buoy, open turns until Gates 3–4'],
  ];
  const TECHNIQUES = [
    ['Antagonist superset (A1/A2)', 'Alternate two exercises, rest only after the pair · every session'],
    ['Biceps and triceps supersets', 'Two exercises back to back for the same muscle · end of Pull and Push'],
    ['Cluster set', 'Heavy set split into mini-sets with 15–20 s racked (e.g. 5 × 3) · hip thrust from Phase 3, pull-ups'],
    ['Rest-pause', 'After the last set, rest 15 s, 2 more mini-sets near failure · rows, hip-thrust back-offs'],
    ['Myo-reps', 'One set of 12–15 to RIR 1, then 4 mini-sets of 3–5 with 5 deep breaths between · curls, triceps, kickbacks'],
    ['Lengthened partials', 'After failure, keep going with half reps in the stretched half · lat pulldown, leg curl (leg curl only after Gate 2)'],
    ['Mechanical drop set', 'Same weight, switch to an easier version and keep going · push-ups, laterals'],
    ['EMOM / AMRAP', 'Fixed work every minute / most rounds in a time cap · Polo Day, finishers'],
    ['Not on the knee yet', 'No drop sets, rest-pause or partials on anything that bends the knee until Gate 2'],
  ];

  window.FS = { EX, P1, P2, P3, LAB, ANGLES, MIN, POLO, POLO_WARM, TURKEY, CORE, CORE_NAMES, CORE_FMT, ROUTINES, PHASES, WEEKS, HT_TEST_WEEK, KNEE_GATES, BACK_CLEAR_DAYS,
    FOODS, DRINKS, DRINK_BUDGET, FREE_MEALS, PROTEIN, KCAL, SUPPS, SLOTS, GUIDES, MIND, MIND_CATS, MIND_TIPS, RESEARCH, PSS10, GAD7,
    TARGET_PATH, BENCHMARKS, SUNDAY_RESET, RED_FLAGS, SWAPPED, TECHNIQUES,
    START: '2026-10-19', FLY: '2027-01-15', GOAL: { from: 141, to: [135, 136.5], date: '2027-01-14' } };
})();

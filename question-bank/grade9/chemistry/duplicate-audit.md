# Chemistry Question Bank — Duplicate Audit (Phase 1)

Generated: 2026-11-15T16:49:18.137Z by `tools/audit-duplicates.js`.

## Method

- **Clone group** = identical *option fingerprint*: the sorted, normalized
  option texts plus the normalized correct-answer text, computed by the
  same `ExamEngine.fingerprintOf()` that runtime practice selection uses.
  Stems are ignored on purpose — that is what makes reworded template
  copies visible. **Scenario questions are never fingerprinted** (their
  stimulus sets must survive whole), so they never enter a clone group
  and are never retired.
- **Keeper rules**: at most **2 keepers per clone group** (clone
  groups are straight-only by the rule above); seeded/authored variants
  beat bulk-generated ones, an explanation beats none, lower id breaks ties.
- **Stem near-duplicates**: token Jaccard ≥ 0.6 within the same chapter + topic, excluding pairs already inside one clone group.

## Summary

| Metric | Value |
|---|---|
| Chemistry questions audited | 2072 |
| Clone groups (≥2 identical fingerprints) | 143 |
| Questions inside clone groups | 1396 (67.4%) |
| Clone variants → keep | 286 |
| Clone variants → **retire** | **1110** |
| Largest clone group | 12 questions |
| Active chemistry bank before → after | 2072 → **962** |
| Additional stem near-dup pairs (actionable) | 30 |

## Scenario template repeats (left active by design)

Scenario questions are excluded from fingerprinting and therefore from
retirement. Quantified here so the reviewer knows exactly what Phase 3
does **not** touch:

| Observation | Groups | Questions |
|---|---|---|
| Identical options+answer **within one stimulus set** (content rewrite needed — a set cannot lose members) | 29 | 118 |
| Identical options+answer **across sets / with straight questions** (different stimuli = different questions) | 36 | 37 |

## Per-chapter impact

| Chapter | Active before | Clone groups | Clone members | Keepers | Retire | Active after |
|---|---|---|---|---|---|---|
| 1 | 107 | 8 | 83 | 16 | 67 | 40 |
| 2 | 143 | 12 | 110 | 24 | 86 | 57 |
| 3 | 239 | 13 | 111 | 26 | 85 | 154 |
| 4 | 176 | 10 | 92 | 20 | 72 | 104 |
| 5 | 166 | 12 | 105 | 24 | 81 | 85 |
| 6 | 130 | 8 | 83 | 16 | 67 | 63 |
| 7 | 122 | 8 | 84 | 16 | 68 | 54 |
| 8 | 122 | 8 | 83 | 16 | 67 | 55 |
| 9 | 115 | 8 | 87 | 16 | 71 | 44 |
| 10 | 148 | 12 | 107 | 24 | 83 | 65 |
| 11 | 140 | 8 | 84 | 16 | 68 | 72 |
| 12 | 117 | 8 | 82 | 16 | 66 | 51 |
| 13 | 138 | 12 | 114 | 24 | 90 | 48 |
| 14 | 100 | 8 | 84 | 16 | 68 | 32 |
| 15 | 109 | 8 | 87 | 16 | 71 | 38 |

## Firestore reference check

Project: `imsg-learning-hub` — retirement is **safe for any collection
listed with 0 hits**. Assignments reference questions **by id**, so a hit
means that assignment would lose questions when the id leaves the active
pool; edit the assignment first (saved exams embed full snapshots and are
never affected).

| Collection | Docs scanned | Docs referencing retirements |
|---|---|---|
| assignments | 12 | 0 |
| exams | 17 | 0 |

✅ No stored assignment or exam references a planned retirement.

## Additional stem near-duplicates (not fingerprint clones)

These pass Jaccard ≥ 0.6 on their stems within one chapter + topic but differ in
options/answer, so runtime fingerprinting cannot collapse them. The
straight pairs below are shipped into `similarity-pairs.json` at score 0.95
so selection still never shows both in one quiz. Scenario pairs are listed
for information only — different stimuli are different questions.

**Actionable (straight) pairs: 30**

| Score | Question A | Question B | Chapter | Topic |
|---|---|---|---|---|
| 0.750 | CH03-MCQ-0212 | CH03-MCQ-0213 | 3 | Ion formation |
| 0.750 | CH04-MCQ-0143 | CH04-MCQ-0144 | 4 | Periodic table group terminology |
| 0.750 | CH05-MCQ-0153 | CH05-MCQ-0154 | 5 | Electropositive and electronegative nature |
| 0.733 | CH04-MCQ-0166 | CH04-MCQ-0167 | 4 | Metals and non-metals |
| 0.731 | CH02-MCQ-0071 | CH02-MCQ-0079 | 2 | Mixtures |
| 0.727 | CH02-MCQ-0072 | CH02-MCQ-0080 | 2 | Mixtures |
| 0.722 | CH02-MCQ-0069 | CH02-MCQ-0077 | 2 | Mixtures |
| 0.717 | CH02-MCQ-0068 | CH02-MCQ-0076 | 2 | Mixtures |
| 0.706 | CH02-MCQ-0070 | CH02-MCQ-0078 | 2 | Mixtures |
| 0.700 | CH08-MCQ-0119 | CH08-MCQ-0120 | 8 | Bond energies |
| 0.692 | CH06-MCQ-0127 | CH06-MCQ-0129 | 6 | Oxidation numbers and ions |
| 0.688 | CH02-MCQ-0066 | CH02-MCQ-0074 | 2 | Mixtures |
| 0.667 | CH06-MCQ-0124 | CH06-MCQ-0125 | 6 | Formula from charges/oxidation numbers |
| 0.654 | CH02-MCQ-0066 | CH02-MCQ-0079 | 2 | Mixtures |
| 0.647 | CH02-MCQ-0066 | CH02-MCQ-0078 | 2 | Mixtures |
| 0.647 | CH02-MCQ-0070 | CH02-MCQ-0074 | 2 | Mixtures |
| 0.635 | CH02-MCQ-0071 | CH02-MCQ-0074 | 2 | Mixtures |
| 0.623 | CH02-MCQ-0066 | CH02-MCQ-0076 | 2 | Mixtures |
| 0.623 | CH02-MCQ-0068 | CH02-MCQ-0074 | 2 | Mixtures |
| 0.621 | CH02-MCQ-0069 | CH02-MCQ-0080 | 2 | Mixtures |
| 0.621 | CH02-MCQ-0072 | CH02-MCQ-0077 | 2 | Mixtures |
| 0.618 | CH02-MCQ-0070 | CH02-MCQ-0079 | 2 | Mixtures |
| 0.611 | CH02-MCQ-0066 | CH02-MCQ-0077 | 2 | Mixtures |
| 0.611 | CH02-MCQ-0069 | CH02-MCQ-0074 | 2 | Mixtures |
| 0.603 | CH02-MCQ-0068 | CH02-MCQ-0080 | 2 | Mixtures |
| 0.603 | CH02-MCQ-0072 | CH02-MCQ-0076 | 2 | Mixtures |
| 0.600 | CH02-MCQ-0066 | CH02-MCQ-0080 | 2 | Mixtures |
| 0.600 | CH02-MCQ-0071 | CH02-MCQ-0078 | 2 | Mixtures |
| 0.600 | CH02-MCQ-0072 | CH02-MCQ-0074 | 2 | Mixtures |
| 0.600 | CH05-MCQ-0161 | CH05-MCQ-0162 | 5 | Common formulae |

_395 additional scenario/mixed-stem pairs were found and intentionally
not shipped (informational only; see `duplicate-audit.json`)._

## All clone groups (143)

Decision legend: **keep** = active after Phase 3, **retire** = flagged
`retired: true` (still in JSON, hidden from practice). Scenario questions
never appear here — they are not fingerprinted (see section above).

### Group 1 — Chapter 3 · Mass number

12 members · 2 keep · 10 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH03-MCQ-0029 | original-seed | The nucleon number of an atom is the total number of: |
| **retire** | CH03-MCQ-0030 | concept-expansion | In the context of Mass number, the nucleon number of an atom is the t... |
| **retire** | CH03-MCQ-0031 | concept-expansion | For the topic "Mass number", the nucleon number of an atom is the tot... |
| **retire** | CH03-MCQ-0032 | concept-expansion | During a Grade 9 chemistry review, The nucleon number of an atom is t... |
| **retire** | CH03-MCQ-0033 | concept-expansion | A chemistry teacher checks understanding of Mass number. The nucleon ... |
| **retire** | CH03-MCQ-0034 | concept-expansion | Consider the concept of Mass number. The nucleon number of an atom is... |
| **retire** | CH03-MCQ-0035 | concept-expansion | Which option correctly answers this question about Mass number? The n... |
| **retire** | CH03-MCQ-0036 | concept-expansion | A learner is revising Mass number. The nucleon number of an atom is t... |
| keep | CH03-MCQ-0107 | authored-expansion-v3.1 | A student is checking the concept of mass number. Which statement sho... |
| **retire** | CH03-MCQ-0108 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH03-MCQ-0118 | authored-recall-v3.1 | Which option correctly states the key fact about mass number? |
| **retire** | CH03-MCQ-0151 | coverage-repair-v3.4 | Nucleon number is the total number of: |

### Group 2 — Chapter 4 · Halogens

12 members · 2 keep · 10 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH04-MCQ-0027 | original-seed | Halogens are found in which group? |
| **retire** | CH04-MCQ-0028 | concept-expansion | In the context of Halogens, halogens are found in which group? |
| **retire** | CH04-MCQ-0029 | concept-expansion | For the topic "Halogens", halogens are found in which group? |
| **retire** | CH04-MCQ-0030 | concept-expansion | During a Grade 9 chemistry review, Halogens are found in which group? |
| **retire** | CH04-MCQ-0031 | concept-expansion | A chemistry teacher checks understanding of Halogens. Halogens are fo... |
| **retire** | CH04-MCQ-0032 | concept-expansion | Consider the concept of Halogens. Halogens are found in which group? |
| **retire** | CH04-MCQ-0033 | concept-expansion | Which option correctly answers this question about Halogens? Halogens... |
| **retire** | CH04-MCQ-0034 | concept-expansion | A learner is revising Halogens. Halogens are found in which group? |
| keep | CH04-MCQ-0067 | authored-expansion-v3.1 | A student is checking the concept of halogens. Which statement should... |
| **retire** | CH04-MCQ-0068 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH04-MCQ-0084 | authored-recall-v3.1 | Which option correctly states the key fact about halogens? |
| **retire** | CH04-MCQ-0092 | authored-recall-v3.1-final | For the Grade 9 topic Halogens, which option gives the correct chemic... |

### Group 3 — Chapter 4 · Noble gases

12 members · 2 keep · 10 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH04-MCQ-0042 | original-seed | Which group contains the noble gases? |
| **retire** | CH04-MCQ-0043 | concept-expansion | In the context of Noble gases, which group contains the noble gases? |
| **retire** | CH04-MCQ-0044 | concept-expansion | For the topic "Noble gases", which group contains the noble gases? |
| **retire** | CH04-MCQ-0045 | concept-expansion | During a Grade 9 chemistry review, Which group contains the noble gases? |
| **retire** | CH04-MCQ-0046 | concept-expansion | A chemistry teacher checks understanding of Noble gases. Which group ... |
| **retire** | CH04-MCQ-0047 | concept-expansion | Consider the concept of Noble gases. Which group contains the noble g... |
| **retire** | CH04-MCQ-0048 | concept-expansion | Which option correctly answers this question about Noble gases? Which... |
| **retire** | CH04-MCQ-0049 | concept-expansion | A learner is revising Noble gases. Which group contains the noble gases? |
| keep | CH04-MCQ-0070 | authored-expansion-v3.1 | A student is checking the concept of noble gases. Which statement sho... |
| **retire** | CH04-MCQ-0071 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH04-MCQ-0085 | authored-recall-v3.1 | For noble gases, which statement is accurate? |
| **retire** | CH04-MCQ-0093 | authored-recall-v3.1-final | For the Grade 9 topic Noble gases, which option gives the correct che... |

### Group 4 — Chapter 9 · Dynamic equilibrium

12 members · 2 keep · 10 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH09-MCQ-0008 | original-seed | At dynamic equilibrium in a closed system: |
| **retire** | CH09-MCQ-0009 | concept-expansion | In the context of Dynamic equilibrium, at dynamic equilibrium in a cl... |
| **retire** | CH09-MCQ-0010 | concept-expansion | For the topic "Dynamic equilibrium", at dynamic equilibrium in a clos... |
| **retire** | CH09-MCQ-0011 | concept-expansion | During a Grade 9 chemistry review, At dynamic equilibrium in a closed... |
| **retire** | CH09-MCQ-0012 | concept-expansion | A chemistry teacher checks understanding of Dynamic equilibrium. At d... |
| **retire** | CH09-MCQ-0013 | concept-expansion | Consider the concept of Dynamic equilibrium. At dynamic equilibrium i... |
| **retire** | CH09-MCQ-0014 | concept-expansion | Which option correctly answers this question about Dynamic equilibriu... |
| **retire** | CH09-MCQ-0015 | concept-expansion | A learner is revising Dynamic equilibrium. At dynamic equilibrium in ... |
| keep | CH09-MCQ-0060 | authored-expansion-v3.1 | A student is checking the concept of dynamic equilibrium. Which state... |
| **retire** | CH09-MCQ-0061 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH09-MCQ-0081 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about dynamic equil... |
| **retire** | CH09-MCQ-0089 | authored-recall-v3.1-final | For the Grade 9 topic Dynamic equilibrium, which option gives the cor... |

### Group 5 — Chapter 9 · Equilibrium condition

12 members · 2 keep · 10 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH09-MCQ-0016 | original-seed | A system at equilibrium must be: |
| **retire** | CH09-MCQ-0017 | concept-expansion | In the context of Equilibrium condition, a system at equilibrium must... |
| **retire** | CH09-MCQ-0018 | concept-expansion | For the topic "Equilibrium condition", a system at equilibrium must be: |
| **retire** | CH09-MCQ-0019 | concept-expansion | During a Grade 9 chemistry review, A system at equilibrium must be: |
| **retire** | CH09-MCQ-0020 | concept-expansion | A chemistry teacher checks understanding of Equilibrium condition. A ... |
| **retire** | CH09-MCQ-0021 | concept-expansion | Consider the concept of Equilibrium condition. A system at equilibriu... |
| **retire** | CH09-MCQ-0022 | concept-expansion | Which option correctly answers this question about Equilibrium condit... |
| **retire** | CH09-MCQ-0023 | concept-expansion | A learner is revising Equilibrium condition. A system at equilibrium ... |
| keep | CH09-MCQ-0063 | authored-expansion-v3.1 | A student is checking the concept of equilibrium condition. Which sta... |
| **retire** | CH09-MCQ-0064 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH09-MCQ-0082 | authored-recall-v3.1 | Which option correctly states the key fact about equilibrium condition? |
| **retire** | CH09-MCQ-0090 | authored-recall-v3.1-final | For the Grade 9 topic Equilibrium condition, which option gives the c... |

### Group 6 — Chapter 15 · Carbohydrates

12 members · 2 keep · 10 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH15-MCQ-0016 | original-seed | Carbohydrates are an important: |
| **retire** | CH15-MCQ-0017 | concept-expansion | In the context of Carbohydrates, carbohydrates are an important: |
| **retire** | CH15-MCQ-0018 | concept-expansion | For the topic "Carbohydrates", carbohydrates are an important: |
| **retire** | CH15-MCQ-0019 | concept-expansion | During a Grade 9 chemistry review, Carbohydrates are an important: |
| **retire** | CH15-MCQ-0020 | concept-expansion | A chemistry teacher checks understanding of Carbohydrates. Carbohydra... |
| **retire** | CH15-MCQ-0021 | concept-expansion | Consider the concept of Carbohydrates. Carbohydrates are an important: |
| **retire** | CH15-MCQ-0022 | concept-expansion | Which option correctly answers this question about Carbohydrates? Car... |
| **retire** | CH15-MCQ-0023 | concept-expansion | A learner is revising Carbohydrates. Carbohydrates are an important: |
| keep | CH15-MCQ-0068 | authored-expansion-v3.1 | A student is checking the concept of carbohydrates. Which statement s... |
| **retire** | CH15-MCQ-0069 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH15-MCQ-0087 | authored-recall-v3.1 | Which option correctly states the key fact about carbohydrates? |
| **retire** | CH15-MCQ-0090 | authored-recall-v3.1-final | For the Grade 9 topic Carbohydrates, which option gives the correct c... |

### Group 7 — Chapter 15 · Biomolecule comparison

12 members · 2 keep · 10 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH15-MCQ-0053 | original-seed | Which pairing is correct? |
| **retire** | CH15-MCQ-0054 | concept-expansion | In the context of Biomolecule comparison, which pairing is correct? |
| **retire** | CH15-MCQ-0055 | concept-expansion | For the topic "Biomolecule comparison", which pairing is correct? |
| **retire** | CH15-MCQ-0056 | concept-expansion | During a Grade 9 chemistry review, Which pairing is correct? |
| **retire** | CH15-MCQ-0057 | concept-expansion | A chemistry teacher checks understanding of Biomolecule comparison. W... |
| **retire** | CH15-MCQ-0058 | concept-expansion | Consider the concept of Biomolecule comparison. Which pairing is corr... |
| **retire** | CH15-MCQ-0059 | concept-expansion | Which option correctly answers this question about Biomolecule compar... |
| **retire** | CH15-MCQ-0060 | concept-expansion | A learner is revising Biomolecule comparison. Which pairing is correct? |
| keep | CH15-MCQ-0062 | authored-expansion-v3.1 | A student is checking the concept of biomolecule comparison. Which st... |
| **retire** | CH15-MCQ-0063 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH15-MCQ-0085 | authored-recall-v3.1 | For biomolecule comparison, which statement is accurate? |
| **retire** | CH15-MCQ-0088 | authored-recall-v3.1-final | For the Grade 9 topic Biomolecule comparison, which option gives the ... |

### Group 8 — Chapter 1 · Definition of chemistry

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH01-MCQ-0001 | original-seed | Chemistry is primarily concerned with the study of: |
| **retire** | CH01-MCQ-0002 | concept-expansion | In the context of Definition of chemistry, chemistry is primarily con... |
| **retire** | CH01-MCQ-0003 | concept-expansion | For the topic "Definition of chemistry", chemistry is primarily conce... |
| **retire** | CH01-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, Chemistry is primarily concerned w... |
| **retire** | CH01-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Definition of chemistry. ... |
| **retire** | CH01-MCQ-0006 | concept-expansion | Which option correctly answers this question about Definition of chem... |
| **retire** | CH01-MCQ-0007 | concept-expansion | A learner is revising Definition of chemistry. Chemistry is primarily... |
| keep | CH01-MCQ-0062 | authored-expansion-v3.1 | A student is checking the concept of definition of chemistry. Which s... |
| **retire** | CH01-MCQ-0063 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH01-MCQ-0079 | authored-recall-v3.1 | Which option correctly states the key fact about definition of chemis... |
| **retire** | CH01-MCQ-0087 | authored-recall-v3.1-final | For the Grade 9 topic Definition of chemistry, which option gives the... |

### Group 9 — Chapter 1 · Essential questions

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH01-MCQ-0020 | original-seed | Which question best represents an essential question for analytical c... |
| **retire** | CH01-MCQ-0021 | concept-expansion | In the context of Essential questions, which question best represents... |
| **retire** | CH01-MCQ-0022 | concept-expansion | For the topic "Essential questions", which question best represents a... |
| **retire** | CH01-MCQ-0023 | concept-expansion | During a Grade 9 chemistry review, Which question best represents an ... |
| **retire** | CH01-MCQ-0024 | concept-expansion | A chemistry teacher checks understanding of Essential questions. Whic... |
| **retire** | CH01-MCQ-0025 | concept-expansion | Which option correctly answers this question about Essential question... |
| **retire** | CH01-MCQ-0026 | concept-expansion | A learner is revising Essential questions. Which question best repres... |
| keep | CH01-MCQ-0068 | authored-expansion-v3.1 | A student is checking the concept of essential questions. Which state... |
| **retire** | CH01-MCQ-0069 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH01-MCQ-0081 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about essential que... |
| **retire** | CH01-MCQ-0089 | authored-recall-v3.1-final | For the Grade 9 topic Essential questions, which option gives the cor... |

### Group 10 — Chapter 1 · Chemistry in daily life

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH01-MCQ-0039 | original-seed | Which example is a direct application of medicinal chemistry? |
| **retire** | CH01-MCQ-0040 | concept-expansion | In the context of Chemistry in daily life, which example is a direct ... |
| **retire** | CH01-MCQ-0041 | concept-expansion | For the topic "Chemistry in daily life", which example is a direct ap... |
| **retire** | CH01-MCQ-0042 | concept-expansion | During a Grade 9 chemistry review, Which example is a direct applicat... |
| **retire** | CH01-MCQ-0043 | concept-expansion | A chemistry teacher checks understanding of Chemistry in daily life. ... |
| **retire** | CH01-MCQ-0044 | concept-expansion | Which option correctly answers this question about Chemistry in daily... |
| **retire** | CH01-MCQ-0045 | concept-expansion | A learner is revising Chemistry in daily life. Which example is a dir... |
| keep | CH01-MCQ-0059 | authored-expansion-v3.1 | A student is checking the concept of chemistry in daily life. Which s... |
| **retire** | CH01-MCQ-0060 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH01-MCQ-0078 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about chemistry in ... |
| **retire** | CH01-MCQ-0086 | authored-recall-v3.1-final | For the Grade 9 topic Chemistry in daily life, which option gives the... |

### Group 11 — Chapter 2 · Matter

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH02-MCQ-0001 | original-seed | Which statement defines matter? |
| **retire** | CH02-MCQ-0002 | concept-expansion | In the context of Matter, which statement defines matter? |
| **retire** | CH02-MCQ-0003 | concept-expansion | For the topic "Matter", which statement defines matter? |
| **retire** | CH02-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, Which statement defines matter? |
| **retire** | CH02-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Matter. Which statement d... |
| **retire** | CH02-MCQ-0006 | concept-expansion | Consider the concept of Matter. Which statement defines matter? |
| **retire** | CH02-MCQ-0007 | concept-expansion | Which option correctly answers this question about Matter? Which stat... |
| **retire** | CH02-MCQ-0008 | concept-expansion | A learner is revising Matter. Which statement defines matter? |
| keep | CH02-MCQ-0096 | authored-expansion-v3.1 | A student is checking the concept of matter. Which statement should b... |
| **retire** | CH02-MCQ-0097 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH02-MCQ-0118 | authored-recall-v3.1 | For matter, which statement is accurate? |

### Group 12 — Chapter 2 · Mixtures

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH02-MCQ-0029 | original-seed | Which is a compound rather than a mixture? |
| **retire** | CH02-MCQ-0030 | concept-expansion | In the context of Mixtures, which is a compound rather than a mixture? |
| **retire** | CH02-MCQ-0031 | concept-expansion | For the topic "Mixtures", which is a compound rather than a mixture? |
| **retire** | CH02-MCQ-0032 | concept-expansion | During a Grade 9 chemistry review, Which is a compound rather than a ... |
| **retire** | CH02-MCQ-0033 | concept-expansion | A chemistry teacher checks understanding of Mixtures. Which is a comp... |
| **retire** | CH02-MCQ-0034 | concept-expansion | Consider the concept of Mixtures. Which is a compound rather than a m... |
| **retire** | CH02-MCQ-0035 | concept-expansion | Which option correctly answers this question about Mixtures? Which is... |
| **retire** | CH02-MCQ-0036 | concept-expansion | A learner is revising Mixtures. Which is a compound rather than a mix... |
| keep | CH02-MCQ-0099 | authored-expansion-v3.1 | A student is checking the concept of mixtures. Which statement should... |
| **retire** | CH02-MCQ-0100 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH02-MCQ-0119 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about mixtures? |

### Group 13 — Chapter 2 · Colloid vs solution

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH02-MCQ-0037 | original-seed | Milk is commonly classified as a: |
| **retire** | CH02-MCQ-0038 | concept-expansion | In the context of Colloid vs solution, milk is commonly classified as a: |
| **retire** | CH02-MCQ-0039 | concept-expansion | For the topic "Colloid vs solution", milk is commonly classified as a: |
| **retire** | CH02-MCQ-0040 | concept-expansion | During a Grade 9 chemistry review, Milk is commonly classified as a: |
| **retire** | CH02-MCQ-0041 | concept-expansion | A chemistry teacher checks understanding of Colloid vs solution. Milk... |
| **retire** | CH02-MCQ-0042 | concept-expansion | Consider the concept of Colloid vs solution. Milk is commonly classif... |
| **retire** | CH02-MCQ-0043 | concept-expansion | Which option correctly answers this question about Colloid vs solutio... |
| **retire** | CH02-MCQ-0044 | concept-expansion | A learner is revising Colloid vs solution. Milk is commonly classifie... |
| keep | CH02-MCQ-0093 | authored-expansion-v3.1 | A student is checking the concept of colloid vs solution. Which state... |
| **retire** | CH02-MCQ-0094 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH02-MCQ-0117 | authored-recall-v3.1 | Which option correctly states the key fact about colloid vs solution? |

### Group 14 — Chapter 3 · Atomic structure

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH03-MCQ-0001 | original-seed | The nucleus of an atom contains: |
| **retire** | CH03-MCQ-0002 | concept-expansion | In the context of Atomic structure, the nucleus of an atom contains: |
| **retire** | CH03-MCQ-0003 | concept-expansion | For the topic "Atomic structure", the nucleus of an atom contains: |
| **retire** | CH03-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, The nucleus of an atom contains: |
| **retire** | CH03-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Atomic structure. The nuc... |
| **retire** | CH03-MCQ-0006 | concept-expansion | Consider the concept of Atomic structure. The nucleus of an atom cont... |
| **retire** | CH03-MCQ-0007 | concept-expansion | Which option correctly answers this question about Atomic structure? ... |
| **retire** | CH03-MCQ-0008 | concept-expansion | A learner is revising Atomic structure. The nucleus of an atom contains: |
| keep | CH03-MCQ-0089 | authored-expansion-v3.1 | A student is checking the concept of atomic structure. Which statemen... |
| **retire** | CH03-MCQ-0090 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH03-MCQ-0114 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about atomic struct... |

### Group 15 — Chapter 4 · Periodic arrangement

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH04-MCQ-0001 | original-seed | The modern periodic table arranges elements primarily in order of inc... |
| **retire** | CH04-MCQ-0002 | concept-expansion | In the context of Periodic arrangement, the modern periodic table arr... |
| **retire** | CH04-MCQ-0003 | concept-expansion | For the topic "Periodic arrangement", the modern periodic table arran... |
| **retire** | CH04-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, The modern periodic table arranges... |
| **retire** | CH04-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Periodic arrangement. The... |
| **retire** | CH04-MCQ-0006 | concept-expansion | Which option correctly answers this question about Periodic arrangeme... |
| **retire** | CH04-MCQ-0007 | concept-expansion | A learner is revising Periodic arrangement. The modern periodic table... |
| keep | CH04-MCQ-0073 | authored-expansion-v3.1 | A student is checking the concept of periodic arrangement. Which stat... |
| **retire** | CH04-MCQ-0074 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH04-MCQ-0086 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about periodic arra... |
| **retire** | CH04-MCQ-0094 | authored-recall-v3.1-final | For the Grade 9 topic Periodic arrangement, which option gives the co... |

### Group 16 — Chapter 4 · Periodic trend

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH04-MCQ-0014 | original-seed | Across a period from left to right, metallic character generally: |
| **retire** | CH04-MCQ-0015 | concept-expansion | In the context of Periodic trend, across a period from left to right,... |
| **retire** | CH04-MCQ-0016 | concept-expansion | For the topic "Periodic trend", across a period from left to right, m... |
| **retire** | CH04-MCQ-0017 | concept-expansion | During a Grade 9 chemistry review, Across a period from left to right... |
| **retire** | CH04-MCQ-0018 | concept-expansion | A chemistry teacher checks understanding of Periodic trend. Across a ... |
| **retire** | CH04-MCQ-0019 | concept-expansion | Which option correctly answers this question about Periodic trend? Ac... |
| **retire** | CH04-MCQ-0020 | concept-expansion | A learner is revising Periodic trend. Across a period from left to ri... |
| keep | CH04-MCQ-0076 | authored-expansion-v3.1 | A student is checking the concept of periodic trend. Which statement ... |
| **retire** | CH04-MCQ-0077 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH04-MCQ-0087 | authored-recall-v3.1 | Which option correctly states the key fact about periodic trend? |
| **retire** | CH04-MCQ-0095 | authored-recall-v3.1-final | For the Grade 9 topic Periodic trend, which option gives the correct ... |

### Group 17 — Chapter 4 · Halogen displacement

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH04-MCQ-0035 | original-seed | Chlorine can displace bromide ions from solution because chlorine is: |
| **retire** | CH04-MCQ-0036 | concept-expansion | In the context of Halogen displacement, chlorine can displace bromide... |
| **retire** | CH04-MCQ-0037 | concept-expansion | For the topic "Halogen displacement", chlorine can displace bromide i... |
| **retire** | CH04-MCQ-0038 | concept-expansion | During a Grade 9 chemistry review, Chlorine can displace bromide ions... |
| **retire** | CH04-MCQ-0039 | concept-expansion | A chemistry teacher checks understanding of Halogen displacement. Chl... |
| **retire** | CH04-MCQ-0040 | concept-expansion | Which option correctly answers this question about Halogen displaceme... |
| **retire** | CH04-MCQ-0041 | concept-expansion | A learner is revising Halogen displacement. Chlorine can displace bro... |
| keep | CH04-MCQ-0064 | authored-expansion-v3.1 | A student is checking the concept of halogen displacement. Which stat... |
| **retire** | CH04-MCQ-0065 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH04-MCQ-0083 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about halogen displ... |
| **retire** | CH04-MCQ-0091 | authored-recall-v3.1-final | For the Grade 9 topic Halogen displacement, which option gives the co... |

### Group 18 — Chapter 4 · Transition elements

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH04-MCQ-0050 | original-seed | Which feature is commonly associated with transition elements? |
| **retire** | CH04-MCQ-0051 | concept-expansion | In the context of Transition elements, which feature is commonly asso... |
| **retire** | CH04-MCQ-0052 | concept-expansion | For the topic "Transition elements", which feature is commonly associ... |
| **retire** | CH04-MCQ-0053 | concept-expansion | During a Grade 9 chemistry review, Which feature is commonly associat... |
| **retire** | CH04-MCQ-0054 | concept-expansion | A chemistry teacher checks understanding of Transition elements. Whic... |
| **retire** | CH04-MCQ-0055 | concept-expansion | Which option correctly answers this question about Transition element... |
| **retire** | CH04-MCQ-0056 | concept-expansion | A learner is revising Transition elements. Which feature is commonly ... |
| keep | CH04-MCQ-0079 | authored-expansion-v3.1 | A student is checking the concept of transition elements. Which state... |
| **retire** | CH04-MCQ-0080 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH04-MCQ-0088 | authored-recall-v3.1 | For transition elements, which statement is accurate? |
| **retire** | CH04-MCQ-0096 | authored-recall-v3.1-final | For the Grade 9 topic Transition elements, which option gives the cor... |

### Group 19 — Chapter 6 · Molecular formula

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH06-MCQ-0001 | original-seed | What does a molecular formula show? |
| **retire** | CH06-MCQ-0002 | concept-expansion | In the context of Molecular formula, what does a molecular formula show? |
| **retire** | CH06-MCQ-0003 | concept-expansion | For the topic "Molecular formula", what does a molecular formula show? |
| **retire** | CH06-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, What does a molecular formula show? |
| **retire** | CH06-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Molecular formula. What d... |
| **retire** | CH06-MCQ-0006 | concept-expansion | Consider the concept of Molecular formula. What does a molecular form... |
| **retire** | CH06-MCQ-0007 | concept-expansion | Which option correctly answers this question about Molecular formula?... |
| **retire** | CH06-MCQ-0008 | concept-expansion | A learner is revising Molecular formula. What does a molecular formul... |
| keep | CH06-MCQ-0076 | authored-expansion-v3.1 | A student is checking the concept of molecular formula. Which stateme... |
| **retire** | CH06-MCQ-0077 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH06-MCQ-0089 | authored-recall-v3.1 | Which option correctly states the key fact about molecular formula? |

### Group 20 — Chapter 6 · Mole

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH06-MCQ-0016 | original-seed | One mole of particles contains approximately: |
| **retire** | CH06-MCQ-0017 | concept-expansion | In the context of Mole, one mole of particles contains approximately: |
| **retire** | CH06-MCQ-0018 | concept-expansion | For the topic "Mole", one mole of particles contains approximately: |
| **retire** | CH06-MCQ-0019 | concept-expansion | During a Grade 9 chemistry review, One mole of particles contains app... |
| **retire** | CH06-MCQ-0020 | concept-expansion | A chemistry teacher checks understanding of Mole. One mole of particl... |
| **retire** | CH06-MCQ-0021 | concept-expansion | Consider the concept of Mole. One mole of particles contains approxim... |
| **retire** | CH06-MCQ-0022 | concept-expansion | Which option correctly answers this question about Mole? One mole of ... |
| **retire** | CH06-MCQ-0023 | concept-expansion | A learner is revising Mole. One mole of particles contains approximat... |
| keep | CH06-MCQ-0073 | authored-expansion-v3.1 | A student is checking the concept of mole. Which statement should be ... |
| **retire** | CH06-MCQ-0074 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH06-MCQ-0088 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about mole? |

### Group 21 — Chapter 6 · Balancing equations

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH06-MCQ-0038 | original-seed | Which coefficients correctly balance H₂ + O₂ → H₂O? |
| **retire** | CH06-MCQ-0039 | concept-expansion | In the context of Balancing equations, which coefficients correctly b... |
| **retire** | CH06-MCQ-0040 | concept-expansion | For the topic "Balancing equations", which coefficients correctly bal... |
| **retire** | CH06-MCQ-0041 | concept-expansion | During a Grade 9 chemistry review, Which coefficients correctly balan... |
| **retire** | CH06-MCQ-0042 | concept-expansion | A chemistry teacher checks understanding of Balancing equations. Whic... |
| **retire** | CH06-MCQ-0043 | concept-expansion | Consider the concept of Balancing equations. Which coefficients corre... |
| **retire** | CH06-MCQ-0044 | concept-expansion | Which option correctly answers this question about Balancing equation... |
| **retire** | CH06-MCQ-0045 | concept-expansion | A learner is revising Balancing equations. Which coefficients correct... |
| keep | CH06-MCQ-0061 | authored-expansion-v3.1 | A student is checking the concept of balancing equations. Which state... |
| **retire** | CH06-MCQ-0062 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH06-MCQ-0084 | authored-recall-v3.1 | For balancing equations, which statement is accurate? |

### Group 22 — Chapter 7 · Oxidation

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH07-MCQ-0001 | original-seed | Oxidation can be described as: |
| **retire** | CH07-MCQ-0002 | concept-expansion | In the context of Oxidation, oxidation can be described as: |
| **retire** | CH07-MCQ-0003 | concept-expansion | For the topic "Oxidation", oxidation can be described as: |
| **retire** | CH07-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, Oxidation can be described as: |
| **retire** | CH07-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Oxidation. Oxidation can ... |
| **retire** | CH07-MCQ-0006 | concept-expansion | Consider the concept of Oxidation. Oxidation can be described as: |
| **retire** | CH07-MCQ-0007 | concept-expansion | Which option correctly answers this question about Oxidation? Oxidati... |
| **retire** | CH07-MCQ-0008 | concept-expansion | A learner is revising Oxidation. Oxidation can be described as: |
| keep | CH07-MCQ-0071 | authored-expansion-v3.1 | A student is checking the concept of oxidation. Which statement shoul... |
| **retire** | CH07-MCQ-0072 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH07-MCQ-0088 | authored-recall-v3.1 | Which option correctly states the key fact about oxidation? |

### Group 23 — Chapter 7 · Reduction

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH07-MCQ-0009 | original-seed | Reduction is associated with: |
| **retire** | CH07-MCQ-0010 | concept-expansion | In the context of Reduction, reduction is associated with: |
| **retire** | CH07-MCQ-0011 | concept-expansion | For the topic "Reduction", reduction is associated with: |
| **retire** | CH07-MCQ-0012 | concept-expansion | During a Grade 9 chemistry review, Reduction is associated with: |
| **retire** | CH07-MCQ-0013 | concept-expansion | A chemistry teacher checks understanding of Reduction. Reduction is a... |
| **retire** | CH07-MCQ-0014 | concept-expansion | Consider the concept of Reduction. Reduction is associated with: |
| **retire** | CH07-MCQ-0015 | concept-expansion | Which option correctly answers this question about Reduction? Reducti... |
| **retire** | CH07-MCQ-0016 | concept-expansion | A learner is revising Reduction. Reduction is associated with: |
| keep | CH07-MCQ-0083 | authored-expansion-v3.1 | A student is checking the concept of reduction. Which statement shoul... |
| **retire** | CH07-MCQ-0084 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH07-MCQ-0092 | authored-recall-v3.1 | For reduction, which statement is accurate? |

### Group 24 — Chapter 7 · Corrosion

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH07-MCQ-0038 | original-seed | Rusting of iron is an example of: |
| **retire** | CH07-MCQ-0039 | concept-expansion | In the context of Corrosion, rusting of iron is an example of: |
| **retire** | CH07-MCQ-0040 | concept-expansion | For the topic "Corrosion", rusting of iron is an example of: |
| **retire** | CH07-MCQ-0041 | concept-expansion | During a Grade 9 chemistry review, Rusting of iron is an example of: |
| **retire** | CH07-MCQ-0042 | concept-expansion | A chemistry teacher checks understanding of Corrosion. Rusting of iro... |
| **retire** | CH07-MCQ-0043 | concept-expansion | Consider the concept of Corrosion. Rusting of iron is an example of: |
| **retire** | CH07-MCQ-0044 | concept-expansion | Which option correctly answers this question about Corrosion? Rusting... |
| **retire** | CH07-MCQ-0045 | concept-expansion | A learner is revising Corrosion. Rusting of iron is an example of: |
| keep | CH07-MCQ-0062 | authored-expansion-v3.1 | A student is checking the concept of corrosion. Which statement shoul... |
| **retire** | CH07-MCQ-0063 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH07-MCQ-0085 | authored-recall-v3.1 | Which option correctly states the key fact about corrosion? |

### Group 25 — Chapter 7 · Electroplating

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH07-MCQ-0046 | original-seed | Electroplating can protect an iron object by: |
| **retire** | CH07-MCQ-0047 | concept-expansion | In the context of Electroplating, electroplating can protect an iron ... |
| **retire** | CH07-MCQ-0048 | concept-expansion | For the topic "Electroplating", electroplating can protect an iron ob... |
| **retire** | CH07-MCQ-0049 | concept-expansion | During a Grade 9 chemistry review, Electroplating can protect an iron... |
| **retire** | CH07-MCQ-0050 | concept-expansion | A chemistry teacher checks understanding of Electroplating. Electropl... |
| **retire** | CH07-MCQ-0051 | concept-expansion | Consider the concept of Electroplating. Electroplating can protect an... |
| **retire** | CH07-MCQ-0052 | concept-expansion | Which option correctly answers this question about Electroplating? El... |
| **retire** | CH07-MCQ-0053 | concept-expansion | A learner is revising Electroplating. Electroplating can protect an i... |
| keep | CH07-MCQ-0065 | authored-expansion-v3.1 | A student is checking the concept of electroplating. Which statement ... |
| **retire** | CH07-MCQ-0066 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH07-MCQ-0086 | authored-recall-v3.1 | For electroplating, which statement is accurate? |

### Group 26 — Chapter 8 · Endothermic reaction

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH08-MCQ-0015 | original-seed | Which process is endothermic? |
| **retire** | CH08-MCQ-0016 | concept-expansion | In the context of Endothermic reaction, which process is endothermic? |
| **retire** | CH08-MCQ-0017 | concept-expansion | For the topic "Endothermic reaction", which process is endothermic? |
| **retire** | CH08-MCQ-0018 | concept-expansion | During a Grade 9 chemistry review, Which process is endothermic? |
| **retire** | CH08-MCQ-0019 | concept-expansion | A chemistry teacher checks understanding of Endothermic reaction. Whi... |
| **retire** | CH08-MCQ-0020 | concept-expansion | Consider the concept of Endothermic reaction. Which process is endoth... |
| **retire** | CH08-MCQ-0021 | concept-expansion | Which option correctly answers this question about Endothermic reacti... |
| **retire** | CH08-MCQ-0022 | concept-expansion | A learner is revising Endothermic reaction. Which process is endother... |
| keep | CH08-MCQ-0079 | authored-expansion-v3.1 | A student is checking the concept of endothermic reaction. Which stat... |
| **retire** | CH08-MCQ-0080 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH08-MCQ-0090 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about endothermic r... |

### Group 27 — Chapter 8 · Catalyst

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH08-MCQ-0030 | original-seed | A catalyst speeds a reaction mainly by: |
| **retire** | CH08-MCQ-0031 | concept-expansion | In the context of Catalyst, a catalyst speeds a reaction mainly by: |
| **retire** | CH08-MCQ-0032 | concept-expansion | For the topic "Catalyst", a catalyst speeds a reaction mainly by: |
| **retire** | CH08-MCQ-0033 | concept-expansion | During a Grade 9 chemistry review, A catalyst speeds a reaction mainl... |
| **retire** | CH08-MCQ-0034 | concept-expansion | A chemistry teacher checks understanding of Catalyst. A catalyst spee... |
| **retire** | CH08-MCQ-0035 | concept-expansion | Consider the concept of Catalyst. A catalyst speeds a reaction mainly... |
| **retire** | CH08-MCQ-0036 | concept-expansion | Which option correctly answers this question about Catalyst? A cataly... |
| **retire** | CH08-MCQ-0037 | concept-expansion | A learner is revising Catalyst. A catalyst speeds a reaction mainly by: |
| keep | CH08-MCQ-0073 | authored-expansion-v3.1 | A student is checking the concept of catalyst. Which statement should... |
| **retire** | CH08-MCQ-0074 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH08-MCQ-0088 | authored-recall-v3.1 | Which option correctly states the key fact about catalyst? |

### Group 28 — Chapter 8 · Bond breaking

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH08-MCQ-0038 | original-seed | Breaking chemical bonds is generally: |
| **retire** | CH08-MCQ-0039 | concept-expansion | In the context of Bond breaking, breaking chemical bonds is generally: |
| **retire** | CH08-MCQ-0040 | concept-expansion | For the topic "Bond breaking", breaking chemical bonds is generally: |
| **retire** | CH08-MCQ-0041 | concept-expansion | During a Grade 9 chemistry review, Breaking chemical bonds is generally: |
| **retire** | CH08-MCQ-0042 | concept-expansion | A chemistry teacher checks understanding of Bond breaking. Breaking c... |
| **retire** | CH08-MCQ-0043 | concept-expansion | Consider the concept of Bond breaking. Breaking chemical bonds is gen... |
| **retire** | CH08-MCQ-0044 | concept-expansion | Which option correctly answers this question about Bond breaking? Bre... |
| **retire** | CH08-MCQ-0045 | concept-expansion | A learner is revising Bond breaking. Breaking chemical bonds is gener... |
| keep | CH08-MCQ-0064 | authored-expansion-v3.1 | A student is checking the concept of bond breaking. Which statement s... |
| **retire** | CH08-MCQ-0065 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH08-MCQ-0085 | authored-recall-v3.1 | Which option correctly states the key fact about bond breaking? |

### Group 29 — Chapter 8 · Bond making

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH08-MCQ-0046 | original-seed | Formation of a chemical bond generally: |
| **retire** | CH08-MCQ-0047 | concept-expansion | In the context of Bond making, formation of a chemical bond generally: |
| **retire** | CH08-MCQ-0048 | concept-expansion | For the topic "Bond making", formation of a chemical bond generally: |
| **retire** | CH08-MCQ-0049 | concept-expansion | During a Grade 9 chemistry review, Formation of a chemical bond gener... |
| **retire** | CH08-MCQ-0050 | concept-expansion | A chemistry teacher checks understanding of Bond making. Formation of... |
| **retire** | CH08-MCQ-0051 | concept-expansion | Consider the concept of Bond making. Formation of a chemical bond gen... |
| **retire** | CH08-MCQ-0052 | concept-expansion | Which option correctly answers this question about Bond making? Forma... |
| **retire** | CH08-MCQ-0053 | concept-expansion | A learner is revising Bond making. Formation of a chemical bond gener... |
| keep | CH08-MCQ-0067 | authored-expansion-v3.1 | A student is checking the concept of bond making. Which statement sho... |
| **retire** | CH08-MCQ-0068 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH08-MCQ-0086 | authored-recall-v3.1 | For bond making, which statement is accurate? |

### Group 30 — Chapter 9 · Reversible reaction

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH09-MCQ-0001 | original-seed | A reversible reaction is commonly represented by: |
| **retire** | CH09-MCQ-0002 | concept-expansion | In the context of Reversible reaction, a reversible reaction is commo... |
| **retire** | CH09-MCQ-0003 | concept-expansion | For the topic "Reversible reaction", a reversible reaction is commonl... |
| **retire** | CH09-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, A reversible reaction is commonly ... |
| **retire** | CH09-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Reversible reaction. A re... |
| **retire** | CH09-MCQ-0006 | concept-expansion | Which option correctly answers this question about Reversible reactio... |
| **retire** | CH09-MCQ-0007 | concept-expansion | A learner is revising Reversible reaction. A reversible reaction is c... |
| keep | CH09-MCQ-0075 | authored-expansion-v3.1 | A student is checking the concept of reversible reaction. Which state... |
| **retire** | CH09-MCQ-0076 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH09-MCQ-0086 | authored-recall-v3.1 | For reversible reaction, which statement is accurate? |
| **retire** | CH09-MCQ-0094 | authored-recall-v3.1-final | For the Grade 9 topic Reversible reaction, which option gives the cor... |

### Group 31 — Chapter 9 · Hydrated copper sulfate

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH09-MCQ-0030 | original-seed | When hydrated copper(II) sulfate is heated, the blue crystals can bec... |
| **retire** | CH09-MCQ-0031 | concept-expansion | In the context of Hydrated copper sulfate, when hydrated copper(II) s... |
| **retire** | CH09-MCQ-0032 | concept-expansion | For the topic "Hydrated copper sulfate", when hydrated copper(II) sul... |
| **retire** | CH09-MCQ-0033 | concept-expansion | During a Grade 9 chemistry review, When hydrated copper(II) sulfate i... |
| **retire** | CH09-MCQ-0034 | concept-expansion | A chemistry teacher checks understanding of Hydrated copper sulfate. ... |
| **retire** | CH09-MCQ-0035 | concept-expansion | Which option correctly answers this question about Hydrated copper su... |
| **retire** | CH09-MCQ-0036 | concept-expansion | A learner is revising Hydrated copper sulfate. When hydrated copper(I... |
| keep | CH09-MCQ-0072 | authored-expansion-v3.1 | A student is checking the concept of hydrated copper sulfate. Which s... |
| **retire** | CH09-MCQ-0073 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH09-MCQ-0085 | authored-recall-v3.1 | Which option correctly states the key fact about hydrated copper sulf... |
| **retire** | CH09-MCQ-0093 | authored-recall-v3.1-final | For the Grade 9 topic Hydrated copper sulfate, which option gives the... |

### Group 32 — Chapter 9 · Equilibrium not completion

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH09-MCQ-0037 | original-seed | At equilibrium, the concentrations of reactants and products are: |
| **retire** | CH09-MCQ-0038 | concept-expansion | In the context of Equilibrium not completion, at equilibrium, the con... |
| **retire** | CH09-MCQ-0039 | concept-expansion | For the topic "Equilibrium not completion", at equilibrium, the conce... |
| **retire** | CH09-MCQ-0040 | concept-expansion | During a Grade 9 chemistry review, At equilibrium, the concentrations... |
| **retire** | CH09-MCQ-0041 | concept-expansion | A chemistry teacher checks understanding of Equilibrium not completio... |
| **retire** | CH09-MCQ-0042 | concept-expansion | Which option correctly answers this question about Equilibrium not co... |
| **retire** | CH09-MCQ-0043 | concept-expansion | A learner is revising Equilibrium not completion. At equilibrium, the... |
| keep | CH09-MCQ-0069 | authored-expansion-v3.1 | A student is checking the concept of equilibrium not completion. Whic... |
| **retire** | CH09-MCQ-0070 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH09-MCQ-0084 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about equilibrium n... |
| **retire** | CH09-MCQ-0092 | authored-recall-v3.1-final | For the Grade 9 topic Equilibrium not completion, which option gives ... |

### Group 33 — Chapter 10 · Brønsted-Lowry acid

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH10-MCQ-0001 | original-seed | A Brønsted-Lowry acid is a: |
| **retire** | CH10-MCQ-0002 | concept-expansion | In the context of Brønsted-Lowry acid, a Brønsted-Lowry acid is a: |
| **retire** | CH10-MCQ-0003 | concept-expansion | For the topic "Brønsted-Lowry acid", a Brønsted-Lowry acid is a: |
| **retire** | CH10-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, A Brønsted-Lowry acid is a: |
| **retire** | CH10-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Brønsted-Lowry acid. A Br... |
| **retire** | CH10-MCQ-0006 | concept-expansion | Consider the concept of Brønsted-Lowry acid. A Brønsted-Lowry acid is a: |
| **retire** | CH10-MCQ-0007 | concept-expansion | Which option correctly answers this question about Brønsted-Lowry aci... |
| **retire** | CH10-MCQ-0008 | concept-expansion | A learner is revising Brønsted-Lowry acid. A Brønsted-Lowry acid is a: |
| keep | CH10-MCQ-0108 | authored-expansion-v3.1 | A student is checking the concept of brønsted-lowry acid. Which state... |
| **retire** | CH10-MCQ-0109 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH10-MCQ-0119 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about brønsted-lowr... |

### Group 34 — Chapter 10 · Brønsted-Lowry base

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH10-MCQ-0009 | original-seed | A Brønsted-Lowry base is a: |
| **retire** | CH10-MCQ-0010 | concept-expansion | In the context of Brønsted-Lowry base, a Brønsted-Lowry base is a: |
| **retire** | CH10-MCQ-0011 | concept-expansion | For the topic "Brønsted-Lowry base", a Brønsted-Lowry base is a: |
| **retire** | CH10-MCQ-0012 | concept-expansion | During a Grade 9 chemistry review, A Brønsted-Lowry base is a: |
| **retire** | CH10-MCQ-0013 | concept-expansion | A chemistry teacher checks understanding of Brønsted-Lowry base. A Br... |
| **retire** | CH10-MCQ-0014 | concept-expansion | Consider the concept of Brønsted-Lowry base. A Brønsted-Lowry base is a: |
| **retire** | CH10-MCQ-0015 | concept-expansion | Which option correctly answers this question about Brønsted-Lowry bas... |
| **retire** | CH10-MCQ-0016 | concept-expansion | A learner is revising Brønsted-Lowry base. A Brønsted-Lowry base is a: |
| keep | CH10-MCQ-0111 | authored-expansion-v3.1 | A student is checking the concept of brønsted-lowry base. Which state... |
| **retire** | CH10-MCQ-0112 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH10-MCQ-0120 | authored-recall-v3.1 | Which option correctly states the key fact about brønsted-lowry base? |

### Group 35 — Chapter 10 · Bases and alkalis

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH10-MCQ-0031 | original-seed | An alkali is best described as a base that: |
| **retire** | CH10-MCQ-0032 | concept-expansion | In the context of Bases and alkalis, an alkali is best described as a... |
| **retire** | CH10-MCQ-0033 | concept-expansion | For the topic "Bases and alkalis", an alkali is best described as a b... |
| **retire** | CH10-MCQ-0034 | concept-expansion | During a Grade 9 chemistry review, An alkali is best described as a b... |
| **retire** | CH10-MCQ-0035 | concept-expansion | A chemistry teacher checks understanding of Bases and alkalis. An alk... |
| **retire** | CH10-MCQ-0036 | concept-expansion | Consider the concept of Bases and alkalis. An alkali is best describe... |
| **retire** | CH10-MCQ-0037 | concept-expansion | Which option correctly answers this question about Bases and alkalis?... |
| **retire** | CH10-MCQ-0038 | concept-expansion | A learner is revising Bases and alkalis. An alkali is best described ... |
| keep | CH10-MCQ-0105 | authored-expansion-v3.1 | A student is checking the concept of bases and alkalis. Which stateme... |
| **retire** | CH10-MCQ-0106 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH10-MCQ-0118 | authored-recall-v3.1 | For bases and alkalis, which statement is accurate? |

### Group 36 — Chapter 11 · Air composition

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH11-MCQ-0001 | original-seed | The largest component of clean, dry air is approximately: |
| **retire** | CH11-MCQ-0002 | concept-expansion | In the context of Air composition, the largest component of clean, dr... |
| **retire** | CH11-MCQ-0003 | concept-expansion | For the topic "Air composition", the largest component of clean, dry ... |
| **retire** | CH11-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, The largest component of clean, dr... |
| **retire** | CH11-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Air composition. The larg... |
| **retire** | CH11-MCQ-0006 | concept-expansion | Which option correctly answers this question about Air composition? T... |
| **retire** | CH11-MCQ-0007 | concept-expansion | A learner is revising Air composition. The largest component of clean... |
| keep | CH11-MCQ-0056 | authored-expansion-v3.1 | A student is checking the concept of air composition. Which statement... |
| **retire** | CH11-MCQ-0057 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH11-MCQ-0077 | authored-recall-v3.1 | Which option correctly states the key fact about air composition? |
| **retire** | CH11-MCQ-0085 | authored-recall-v3.1-final | For the Grade 9 topic Air composition, which option gives the correct... |

### Group 37 — Chapter 11 · Carbon dioxide source

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH11-MCQ-0008 | original-seed | Complete combustion of a carbon-containing fuel mainly produces: |
| **retire** | CH11-MCQ-0009 | concept-expansion | In the context of Carbon dioxide source, complete combustion of a car... |
| **retire** | CH11-MCQ-0010 | concept-expansion | For the topic "Carbon dioxide source", complete combustion of a carbo... |
| **retire** | CH11-MCQ-0011 | concept-expansion | During a Grade 9 chemistry review, Complete combustion of a carbon-co... |
| **retire** | CH11-MCQ-0012 | concept-expansion | A chemistry teacher checks understanding of Carbon dioxide source. Co... |
| **retire** | CH11-MCQ-0013 | concept-expansion | Which option correctly answers this question about Carbon dioxide sou... |
| **retire** | CH11-MCQ-0014 | concept-expansion | A learner is revising Carbon dioxide source. Complete combustion of a... |
| keep | CH11-MCQ-0059 | authored-expansion-v3.1 | A student is checking the concept of carbon dioxide source. Which sta... |
| **retire** | CH11-MCQ-0060 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH11-MCQ-0078 | authored-recall-v3.1 | For carbon dioxide source, which statement is accurate? |
| **retire** | CH11-MCQ-0086 | authored-recall-v3.1-final | For the Grade 9 topic Carbon dioxide source, which option gives the c... |

### Group 38 — Chapter 11 · Carbon monoxide

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH11-MCQ-0015 | original-seed | Carbon monoxide is hazardous mainly because it is: |
| **retire** | CH11-MCQ-0016 | concept-expansion | In the context of Carbon monoxide, carbon monoxide is hazardous mainl... |
| **retire** | CH11-MCQ-0017 | concept-expansion | For the topic "Carbon monoxide", carbon monoxide is hazardous mainly ... |
| **retire** | CH11-MCQ-0018 | concept-expansion | During a Grade 9 chemistry review, Carbon monoxide is hazardous mainl... |
| **retire** | CH11-MCQ-0019 | concept-expansion | A chemistry teacher checks understanding of Carbon monoxide. Carbon m... |
| **retire** | CH11-MCQ-0020 | concept-expansion | Which option correctly answers this question about Carbon monoxide? C... |
| **retire** | CH11-MCQ-0021 | concept-expansion | A learner is revising Carbon monoxide. Carbon monoxide is hazardous m... |
| keep | CH11-MCQ-0062 | authored-expansion-v3.1 | A student is checking the concept of carbon monoxide. Which statement... |
| **retire** | CH11-MCQ-0063 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH11-MCQ-0079 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about carbon monoxide? |
| **retire** | CH11-MCQ-0087 | authored-recall-v3.1-final | For the Grade 9 topic Carbon monoxide, which option gives the correct... |

### Group 39 — Chapter 11 · Particulates

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH11-MCQ-0022 | original-seed | Fine particulate pollution is associated with increased risk of: |
| **retire** | CH11-MCQ-0023 | concept-expansion | In the context of Particulates, fine particulate pollution is associa... |
| **retire** | CH11-MCQ-0024 | concept-expansion | For the topic "Particulates", fine particulate pollution is associate... |
| **retire** | CH11-MCQ-0025 | concept-expansion | During a Grade 9 chemistry review, Fine particulate pollution is asso... |
| **retire** | CH11-MCQ-0026 | concept-expansion | A chemistry teacher checks understanding of Particulates. Fine partic... |
| **retire** | CH11-MCQ-0027 | concept-expansion | Which option correctly answers this question about Particulates? Fine... |
| **retire** | CH11-MCQ-0028 | concept-expansion | A learner is revising Particulates. Fine particulate pollution is ass... |
| keep | CH11-MCQ-0071 | authored-expansion-v3.1 | A student is checking the concept of particulates. Which statement sh... |
| **retire** | CH11-MCQ-0072 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH11-MCQ-0082 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about particulates? |
| **retire** | CH11-MCQ-0090 | authored-recall-v3.1-final | For the Grade 9 topic Particulates, which option gives the correct ch... |

### Group 40 — Chapter 11 · Greenhouse gases

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH11-MCQ-0029 | original-seed | Carbon dioxide and methane contribute to global warming mainly becaus... |
| **retire** | CH11-MCQ-0030 | concept-expansion | In the context of Greenhouse gases, carbon dioxide and methane contri... |
| **retire** | CH11-MCQ-0031 | concept-expansion | For the topic "Greenhouse gases", carbon dioxide and methane contribu... |
| **retire** | CH11-MCQ-0032 | concept-expansion | During a Grade 9 chemistry review, Carbon dioxide and methane contrib... |
| **retire** | CH11-MCQ-0033 | concept-expansion | A chemistry teacher checks understanding of Greenhouse gases. Carbon ... |
| **retire** | CH11-MCQ-0034 | concept-expansion | Which option correctly answers this question about Greenhouse gases? ... |
| **retire** | CH11-MCQ-0035 | concept-expansion | A learner is revising Greenhouse gases. Carbon dioxide and methane co... |
| keep | CH11-MCQ-0068 | authored-expansion-v3.1 | A student is checking the concept of greenhouse gases. Which statemen... |
| **retire** | CH11-MCQ-0069 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH11-MCQ-0081 | authored-recall-v3.1 | For greenhouse gases, which statement is accurate? |
| **retire** | CH11-MCQ-0089 | authored-recall-v3.1-final | For the Grade 9 topic Greenhouse gases, which option gives the correc... |

### Group 41 — Chapter 11 · Pollution reduction

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH11-MCQ-0048 | original-seed | Which strategy directly reduces carbon dioxide emissions from fossil-... |
| **retire** | CH11-MCQ-0049 | concept-expansion | In the context of Pollution reduction, which strategy directly reduce... |
| **retire** | CH11-MCQ-0050 | concept-expansion | For the topic "Pollution reduction", which strategy directly reduces ... |
| **retire** | CH11-MCQ-0051 | concept-expansion | During a Grade 9 chemistry review, Which strategy directly reduces ca... |
| **retire** | CH11-MCQ-0052 | concept-expansion | A chemistry teacher checks understanding of Pollution reduction. Whic... |
| **retire** | CH11-MCQ-0053 | concept-expansion | Which option correctly answers this question about Pollution reductio... |
| **retire** | CH11-MCQ-0054 | concept-expansion | A learner is revising Pollution reduction. Which strategy directly re... |
| keep | CH11-MCQ-0074 | authored-expansion-v3.1 | A student is checking the concept of pollution reduction. Which state... |
| **retire** | CH11-MCQ-0075 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH11-MCQ-0083 | authored-recall-v3.1 | Which option correctly states the key fact about pollution reduction? |
| **retire** | CH11-MCQ-0091 | authored-recall-v3.1-final | For the Grade 9 topic Pollution reduction, which option gives the cor... |

### Group 42 — Chapter 12 · Disinfection

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH12-MCQ-0021 | original-seed | Chlorination of domestic water is primarily used to: |
| **retire** | CH12-MCQ-0022 | concept-expansion | In the context of Disinfection, chlorination of domestic water is pri... |
| **retire** | CH12-MCQ-0023 | concept-expansion | For the topic "Disinfection", chlorination of domestic water is prima... |
| **retire** | CH12-MCQ-0024 | concept-expansion | During a Grade 9 chemistry review, Chlorination of domestic water is ... |
| **retire** | CH12-MCQ-0025 | concept-expansion | A chemistry teacher checks understanding of Disinfection. Chlorinatio... |
| **retire** | CH12-MCQ-0026 | concept-expansion | Consider the concept of Disinfection. Chlorination of domestic water ... |
| **retire** | CH12-MCQ-0027 | concept-expansion | Which option correctly answers this question about Disinfection? Chlo... |
| **retire** | CH12-MCQ-0028 | concept-expansion | A learner is revising Disinfection. Chlorination of domestic water is... |
| keep | CH12-MCQ-0060 | authored-expansion-v3.1 | A student is checking the concept of disinfection. Which statement sh... |
| **retire** | CH12-MCQ-0061 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH12-MCQ-0083 | authored-recall-v3.1 | For disinfection, which statement is accurate? |

### Group 43 — Chapter 12 · Fertilizers

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH12-MCQ-0043 | original-seed | Which fertilizer supplies nitrogen to crops? |
| **retire** | CH12-MCQ-0044 | concept-expansion | In the context of Fertilizers, which fertilizer supplies nitrogen to ... |
| **retire** | CH12-MCQ-0045 | concept-expansion | For the topic "Fertilizers", which fertilizer supplies nitrogen to cr... |
| **retire** | CH12-MCQ-0046 | concept-expansion | During a Grade 9 chemistry review, Which fertilizer supplies nitrogen... |
| **retire** | CH12-MCQ-0047 | concept-expansion | A chemistry teacher checks understanding of Fertilizers. Which fertil... |
| **retire** | CH12-MCQ-0048 | concept-expansion | Consider the concept of Fertilizers. Which fertilizer supplies nitrog... |
| **retire** | CH12-MCQ-0049 | concept-expansion | Which option correctly answers this question about Fertilizers? Which... |
| **retire** | CH12-MCQ-0050 | concept-expansion | A learner is revising Fertilizers. Which fertilizer supplies nitrogen... |
| keep | CH12-MCQ-0066 | authored-expansion-v3.1 | A student is checking the concept of fertilizers. Which statement sho... |
| **retire** | CH12-MCQ-0067 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH12-MCQ-0085 | authored-recall-v3.1 | Which option correctly states the key fact about fertilizers? |

### Group 44 — Chapter 12 · NPK

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH12-MCQ-0051 | original-seed | The letters N, P and K in NPK fertilizer refer to: |
| **retire** | CH12-MCQ-0052 | concept-expansion | In the context of NPK, the letters N, P and K in NPK fertilizer refer... |
| **retire** | CH12-MCQ-0053 | concept-expansion | For the topic "NPK", the letters N, P and K in NPK fertilizer refer to: |
| **retire** | CH12-MCQ-0054 | concept-expansion | During a Grade 9 chemistry review, The letters N, P and K in NPK fert... |
| **retire** | CH12-MCQ-0055 | concept-expansion | A chemistry teacher checks understanding of NPK. The letters N, P and... |
| **retire** | CH12-MCQ-0056 | concept-expansion | Consider the concept of NPK. The letters N, P and K in NPK fertilizer... |
| **retire** | CH12-MCQ-0057 | concept-expansion | Which option correctly answers this question about NPK? The letters N... |
| **retire** | CH12-MCQ-0058 | concept-expansion | A learner is revising NPK. The letters N, P and K in NPK fertilizer r... |
| keep | CH12-MCQ-0069 | authored-expansion-v3.1 | A student is checking the concept of npk. Which statement should be a... |
| **retire** | CH12-MCQ-0070 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH12-MCQ-0086 | authored-recall-v3.1 | For npk, which statement is accurate? |

### Group 45 — Chapter 13 · Structural formula

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH13-MCQ-0008 | original-seed | A structural formula shows: |
| **retire** | CH13-MCQ-0009 | concept-expansion | In the context of Structural formula, a structural formula shows: |
| **retire** | CH13-MCQ-0010 | concept-expansion | For the topic "Structural formula", a structural formula shows: |
| **retire** | CH13-MCQ-0011 | concept-expansion | During a Grade 9 chemistry review, A structural formula shows: |
| **retire** | CH13-MCQ-0012 | concept-expansion | A chemistry teacher checks understanding of Structural formula. A str... |
| **retire** | CH13-MCQ-0013 | concept-expansion | Consider the concept of Structural formula. A structural formula shows: |
| **retire** | CH13-MCQ-0014 | concept-expansion | Which option correctly answers this question about Structural formula... |
| **retire** | CH13-MCQ-0015 | concept-expansion | A learner is revising Structural formula. A structural formula shows: |
| keep | CH13-MCQ-0113 | authored-expansion-v3.1 | A student is checking the concept of structural formula. Which statem... |
| **retire** | CH13-MCQ-0114 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH13-MCQ-0126 | authored-recall-v3.1 | For structural formula, which statement is accurate? |

### Group 46 — Chapter 13 · General formula

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH13-MCQ-0045 | original-seed | Which general formula represents alkanes? |
| **retire** | CH13-MCQ-0046 | concept-expansion | In the context of General formula, which general formula represents a... |
| **retire** | CH13-MCQ-0047 | concept-expansion | For the topic "General formula", which general formula represents alk... |
| **retire** | CH13-MCQ-0048 | concept-expansion | During a Grade 9 chemistry review, Which general formula represents a... |
| **retire** | CH13-MCQ-0049 | concept-expansion | A chemistry teacher checks understanding of General formula. Which ge... |
| **retire** | CH13-MCQ-0050 | concept-expansion | Consider the concept of General formula. Which general formula repres... |
| **retire** | CH13-MCQ-0051 | concept-expansion | Which option correctly answers this question about General formula? W... |
| **retire** | CH13-MCQ-0052 | concept-expansion | A learner is revising General formula. Which general formula represen... |
| keep | CH13-MCQ-0098 | authored-expansion-v3.1 | A student is checking the concept of general formula. Which statement... |
| **retire** | CH13-MCQ-0099 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH13-MCQ-0121 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about general formula? |

### Group 47 — Chapter 13 · Isomer identification

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH13-MCQ-0060 | original-seed | Which pair represents structural isomers? |
| **retire** | CH13-MCQ-0061 | concept-expansion | In the context of Isomer identification, which pair represents struct... |
| **retire** | CH13-MCQ-0062 | concept-expansion | For the topic "Isomer identification", which pair represents structur... |
| **retire** | CH13-MCQ-0063 | concept-expansion | During a Grade 9 chemistry review, Which pair represents structural i... |
| **retire** | CH13-MCQ-0064 | concept-expansion | A chemistry teacher checks understanding of Isomer identification. Wh... |
| **retire** | CH13-MCQ-0065 | concept-expansion | Consider the concept of Isomer identification. Which pair represents ... |
| **retire** | CH13-MCQ-0066 | concept-expansion | Which option correctly answers this question about Isomer identificat... |
| **retire** | CH13-MCQ-0067 | concept-expansion | A learner is revising Isomer identification. Which pair represents st... |
| keep | CH13-MCQ-0104 | authored-expansion-v3.1 | A student is checking the concept of isomer identification. Which sta... |
| **retire** | CH13-MCQ-0105 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH13-MCQ-0123 | authored-recall-v3.1 | For isomer identification, which statement is accurate? |

### Group 48 — Chapter 13 · Formula interpretation

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH13-MCQ-0068 | original-seed | Which formula represents ethanol? |
| **retire** | CH13-MCQ-0069 | concept-expansion | In the context of Formula interpretation, which formula represents et... |
| **retire** | CH13-MCQ-0070 | concept-expansion | For the topic "Formula interpretation", which formula represents etha... |
| **retire** | CH13-MCQ-0071 | concept-expansion | During a Grade 9 chemistry review, Which formula represents ethanol? |
| **retire** | CH13-MCQ-0072 | concept-expansion | A chemistry teacher checks understanding of Formula interpretation. W... |
| **retire** | CH13-MCQ-0073 | concept-expansion | Consider the concept of Formula interpretation. Which formula represe... |
| **retire** | CH13-MCQ-0074 | concept-expansion | Which option correctly answers this question about Formula interpreta... |
| **retire** | CH13-MCQ-0075 | concept-expansion | A learner is revising Formula interpretation. Which formula represent... |
| keep | CH13-MCQ-0092 | authored-expansion-v3.1 | A student is checking the concept of formula interpretation. Which st... |
| **retire** | CH13-MCQ-0093 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH13-MCQ-0119 | authored-recall-v3.1 | Which option correctly states the key fact about formula interpretation? |

### Group 49 — Chapter 14 · Saturated compounds

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH14-MCQ-0001 | original-seed | A saturated hydrocarbon contains only: |
| **retire** | CH14-MCQ-0002 | concept-expansion | In the context of Saturated compounds, a saturated hydrocarbon contai... |
| **retire** | CH14-MCQ-0003 | concept-expansion | For the topic "Saturated compounds", a saturated hydrocarbon contains... |
| **retire** | CH14-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, A saturated hydrocarbon contains o... |
| **retire** | CH14-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Saturated compounds. A sa... |
| **retire** | CH14-MCQ-0006 | concept-expansion | Consider the concept of Saturated compounds. A saturated hydrocarbon ... |
| **retire** | CH14-MCQ-0007 | concept-expansion | Which option correctly answers this question about Saturated compound... |
| **retire** | CH14-MCQ-0008 | concept-expansion | A learner is revising Saturated compounds. A saturated hydrocarbon co... |
| keep | CH14-MCQ-0077 | authored-expansion-v3.1 | A student is checking the concept of saturated compounds. Which state... |
| **retire** | CH14-MCQ-0078 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH14-MCQ-0090 | authored-recall-v3.1 | For saturated compounds, which statement is accurate? |

### Group 50 — Chapter 14 · Alkanes

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH14-MCQ-0016 | original-seed | Alkanes are classified as: |
| **retire** | CH14-MCQ-0017 | concept-expansion | In the context of Alkanes, alkanes are classified as: |
| **retire** | CH14-MCQ-0018 | concept-expansion | For the topic "Alkanes", alkanes are classified as: |
| **retire** | CH14-MCQ-0019 | concept-expansion | During a Grade 9 chemistry review, Alkanes are classified as: |
| **retire** | CH14-MCQ-0020 | concept-expansion | A chemistry teacher checks understanding of Alkanes. Alkanes are clas... |
| **retire** | CH14-MCQ-0021 | concept-expansion | Consider the concept of Alkanes. Alkanes are classified as: |
| **retire** | CH14-MCQ-0022 | concept-expansion | Which option correctly answers this question about Alkanes? Alkanes a... |
| **retire** | CH14-MCQ-0023 | concept-expansion | A learner is revising Alkanes. Alkanes are classified as: |
| keep | CH14-MCQ-0065 | authored-expansion-v3.1 | A student is checking the concept of alkanes. Which statement should ... |
| **retire** | CH14-MCQ-0066 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH14-MCQ-0086 | authored-recall-v3.1 | Which option correctly states the key fact about alkanes? |

### Group 51 — Chapter 14 · Alkane properties

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH14-MCQ-0024 | original-seed | Which statement about alkanes is correct? |
| **retire** | CH14-MCQ-0025 | concept-expansion | In the context of Alkane properties, which statement about alkanes is... |
| **retire** | CH14-MCQ-0026 | concept-expansion | For the topic "Alkane properties", which statement about alkanes is c... |
| **retire** | CH14-MCQ-0027 | concept-expansion | During a Grade 9 chemistry review, Which statement about alkanes is c... |
| **retire** | CH14-MCQ-0028 | concept-expansion | A chemistry teacher checks understanding of Alkane properties. Which ... |
| **retire** | CH14-MCQ-0029 | concept-expansion | Consider the concept of Alkane properties. Which statement about alka... |
| **retire** | CH14-MCQ-0030 | concept-expansion | Which option correctly answers this question about Alkane properties?... |
| **retire** | CH14-MCQ-0031 | concept-expansion | A learner is revising Alkane properties. Which statement about alkane... |
| keep | CH14-MCQ-0062 | authored-expansion-v3.1 | A student is checking the concept of alkane properties. Which stateme... |
| **retire** | CH14-MCQ-0063 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH14-MCQ-0085 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about alkane proper... |

### Group 52 — Chapter 14 · Cracking

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH14-MCQ-0045 | original-seed | Cracking is used to convert: |
| **retire** | CH14-MCQ-0046 | concept-expansion | In the context of Cracking, cracking is used to convert: |
| **retire** | CH14-MCQ-0047 | concept-expansion | For the topic "Cracking", cracking is used to convert: |
| **retire** | CH14-MCQ-0048 | concept-expansion | During a Grade 9 chemistry review, Cracking is used to convert: |
| **retire** | CH14-MCQ-0049 | concept-expansion | A chemistry teacher checks understanding of Cracking. Cracking is use... |
| **retire** | CH14-MCQ-0050 | concept-expansion | Consider the concept of Cracking. Cracking is used to convert: |
| **retire** | CH14-MCQ-0051 | concept-expansion | Which option correctly answers this question about Cracking? Cracking... |
| **retire** | CH14-MCQ-0052 | concept-expansion | A learner is revising Cracking. Cracking is used to convert: |
| keep | CH14-MCQ-0068 | authored-expansion-v3.1 | A student is checking the concept of cracking. Which statement should... |
| **retire** | CH14-MCQ-0069 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH14-MCQ-0087 | authored-recall-v3.1 | For cracking, which statement is accurate? |

### Group 53 — Chapter 14 · Hydrogenation

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH14-MCQ-0053 | original-seed | Hydrogenation of an alkene generally involves: |
| **retire** | CH14-MCQ-0054 | concept-expansion | In the context of Hydrogenation, hydrogenation of an alkene generally... |
| **retire** | CH14-MCQ-0055 | concept-expansion | For the topic "Hydrogenation", hydrogenation of an alkene generally i... |
| **retire** | CH14-MCQ-0056 | concept-expansion | During a Grade 9 chemistry review, Hydrogenation of an alkene general... |
| **retire** | CH14-MCQ-0057 | concept-expansion | A chemistry teacher checks understanding of Hydrogenation. Hydrogenat... |
| **retire** | CH14-MCQ-0058 | concept-expansion | Consider the concept of Hydrogenation. Hydrogenation of an alkene gen... |
| **retire** | CH14-MCQ-0059 | concept-expansion | Which option correctly answers this question about Hydrogenation? Hyd... |
| **retire** | CH14-MCQ-0060 | concept-expansion | A learner is revising Hydrogenation. Hydrogenation of an alkene gener... |
| keep | CH14-MCQ-0071 | authored-expansion-v3.1 | A student is checking the concept of hydrogenation. Which statement s... |
| **retire** | CH14-MCQ-0072 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH14-MCQ-0088 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about hydrogenation? |

### Group 54 — Chapter 15 · Nutrition

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH15-MCQ-0001 | original-seed | A balanced diet is important because it: |
| **retire** | CH15-MCQ-0002 | concept-expansion | In the context of Nutrition, a balanced diet is important because it: |
| **retire** | CH15-MCQ-0003 | concept-expansion | For the topic "Nutrition", a balanced diet is important because it: |
| **retire** | CH15-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, A balanced diet is important becau... |
| **retire** | CH15-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Nutrition. A balanced die... |
| **retire** | CH15-MCQ-0006 | concept-expansion | Consider the concept of Nutrition. A balanced diet is important becau... |
| **retire** | CH15-MCQ-0007 | concept-expansion | Which option correctly answers this question about Nutrition? A balan... |
| **retire** | CH15-MCQ-0008 | concept-expansion | A learner is revising Nutrition. A balanced diet is important because... |
| keep | CH15-MCQ-0080 | authored-expansion-v3.1 | A student is checking the concept of nutrition. Which statement shoul... |
| **retire** | CH15-MCQ-0081 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH15-MCQ-0094 | authored-recall-v3.1-final | For the Grade 9 topic Nutrition, which option gives the correct chemi... |

### Group 55 — Chapter 15 · Biomolecules

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH15-MCQ-0009 | original-seed | Which group contains the four main biomolecule categories emphasized ... |
| **retire** | CH15-MCQ-0010 | concept-expansion | In the context of Biomolecules, which group contains the four main bi... |
| **retire** | CH15-MCQ-0011 | concept-expansion | For the topic "Biomolecules", which group contains the four main biom... |
| **retire** | CH15-MCQ-0012 | concept-expansion | During a Grade 9 chemistry review, Which group contains the four main... |
| **retire** | CH15-MCQ-0013 | concept-expansion | A chemistry teacher checks understanding of Biomolecules. Which group... |
| **retire** | CH15-MCQ-0014 | concept-expansion | Which option correctly answers this question about Biomolecules? Whic... |
| **retire** | CH15-MCQ-0015 | concept-expansion | A learner is revising Biomolecules. Which group contains the four mai... |
| keep | CH15-MCQ-0065 | authored-expansion-v3.1 | A student is checking the concept of biomolecules. Which statement sh... |
| **retire** | CH15-MCQ-0066 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH15-MCQ-0086 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about biomolecules? |
| **retire** | CH15-MCQ-0089 | authored-recall-v3.1-final | For the Grade 9 topic Biomolecules, which option gives the correct ch... |

### Group 56 — Chapter 15 · Lipids

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH15-MCQ-0031 | original-seed | A major role of lipids in the body is: |
| **retire** | CH15-MCQ-0032 | concept-expansion | In the context of Lipids, a major role of lipids in the body is: |
| **retire** | CH15-MCQ-0033 | concept-expansion | For the topic "Lipids", a major role of lipids in the body is: |
| **retire** | CH15-MCQ-0034 | concept-expansion | During a Grade 9 chemistry review, A major role of lipids in the body... |
| **retire** | CH15-MCQ-0035 | concept-expansion | A chemistry teacher checks understanding of Lipids. A major role of l... |
| **retire** | CH15-MCQ-0036 | concept-expansion | Consider the concept of Lipids. A major role of lipids in the body is: |
| **retire** | CH15-MCQ-0037 | concept-expansion | Which option correctly answers this question about Lipids? A major ro... |
| **retire** | CH15-MCQ-0038 | concept-expansion | A learner is revising Lipids. A major role of lipids in the body is: |
| keep | CH15-MCQ-0074 | authored-expansion-v3.1 | A student is checking the concept of lipids. Which statement should b... |
| **retire** | CH15-MCQ-0075 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH15-MCQ-0092 | authored-recall-v3.1-final | For the Grade 9 topic Lipids, which option gives the correct chemical... |

### Group 57 — Chapter 15 · Nucleic acids

11 members · 2 keep · 9 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH15-MCQ-0039 | original-seed | DNA and RNA belong to the class of: |
| **retire** | CH15-MCQ-0040 | concept-expansion | In the context of Nucleic acids, dNA and RNA belong to the class of: |
| **retire** | CH15-MCQ-0041 | concept-expansion | For the topic "Nucleic acids", dNA and RNA belong to the class of: |
| **retire** | CH15-MCQ-0042 | concept-expansion | During a Grade 9 chemistry review, DNA and RNA belong to the class of: |
| **retire** | CH15-MCQ-0043 | concept-expansion | A chemistry teacher checks understanding of Nucleic acids. DNA and RN... |
| **retire** | CH15-MCQ-0044 | concept-expansion | Consider the concept of Nucleic acids. DNA and RNA belong to the clas... |
| **retire** | CH15-MCQ-0045 | concept-expansion | Which option correctly answers this question about Nucleic acids? DNA... |
| **retire** | CH15-MCQ-0046 | concept-expansion | A learner is revising Nucleic acids. DNA and RNA belong to the class of: |
| keep | CH15-MCQ-0077 | authored-expansion-v3.1 | A student is checking the concept of nucleic acids. Which statement s... |
| **retire** | CH15-MCQ-0078 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH15-MCQ-0093 | authored-recall-v3.1-final | For the Grade 9 topic Nucleic acids, which option gives the correct c... |

### Group 58 — Chapter 1 · Branches of chemistry

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH01-MCQ-0008 | original-seed | Which branch of chemistry focuses on identifying and measuring the co... |
| **retire** | CH01-MCQ-0009 | concept-expansion | In the context of Branches of chemistry, which branch of chemistry fo... |
| **retire** | CH01-MCQ-0010 | concept-expansion | During a Grade 9 chemistry review, Which branch of chemistry focuses ... |
| **retire** | CH01-MCQ-0011 | concept-expansion | A chemistry teacher checks understanding of Branches of chemistry. Wh... |
| **retire** | CH01-MCQ-0012 | concept-expansion | Which option correctly answers this question about Branches of chemis... |
| **retire** | CH01-MCQ-0013 | concept-expansion | A learner is revising Branches of chemistry. Which branch of chemistr... |
| keep | CH01-MCQ-0056 | authored-expansion-v3.1 | A student is checking the concept of branches of chemistry. Which sta... |
| **retire** | CH01-MCQ-0057 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH01-MCQ-0077 | authored-recall-v3.1 | For branches of chemistry, which statement is accurate? |
| **retire** | CH01-MCQ-0085 | authored-recall-v3.1-final | For the Grade 9 topic Branches of chemistry, which option gives the c... |

### Group 59 — Chapter 1 · Interdisciplinary chemistry

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH01-MCQ-0014 | original-seed | A researcher studies chemical reactions occurring in living cells. Wh... |
| **retire** | CH01-MCQ-0015 | concept-expansion | In the context of Interdisciplinary chemistry, a researcher studies c... |
| **retire** | CH01-MCQ-0016 | concept-expansion | During a Grade 9 chemistry review, A researcher studies chemical reac... |
| **retire** | CH01-MCQ-0017 | concept-expansion | A chemistry teacher checks understanding of Interdisciplinary chemist... |
| **retire** | CH01-MCQ-0018 | concept-expansion | Which option correctly answers this question about Interdisciplinary ... |
| **retire** | CH01-MCQ-0019 | concept-expansion | A learner is revising Interdisciplinary chemistry. A researcher studi... |
| keep | CH01-MCQ-0071 | authored-expansion-v3.1 | A student is checking the concept of interdisciplinary chemistry. Whi... |
| **retire** | CH01-MCQ-0072 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH01-MCQ-0082 | authored-recall-v3.1 | Which option correctly states the key fact about interdisciplinary ch... |
| **retire** | CH01-MCQ-0090 | authored-recall-v3.1-final | For the Grade 9 topic Interdisciplinary chemistry, which option gives... |

### Group 60 — Chapter 1 · Science vs technology

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH01-MCQ-0027 | original-seed | A chemist develops evidence about how a reaction works, while another... |
| **retire** | CH01-MCQ-0028 | concept-expansion | In the context of Science vs technology, a chemist develops evidence ... |
| **retire** | CH01-MCQ-0029 | concept-expansion | During a Grade 9 chemistry review, A chemist develops evidence about ... |
| **retire** | CH01-MCQ-0030 | concept-expansion | A chemistry teacher checks understanding of Science vs technology. A ... |
| **retire** | CH01-MCQ-0031 | concept-expansion | Which option correctly answers this question about Science vs technol... |
| **retire** | CH01-MCQ-0032 | concept-expansion | A learner is revising Science vs technology. A chemist develops evide... |
| keep | CH01-MCQ-0074 | authored-expansion-v3.1 | A student is checking the concept of science vs technology. Which sta... |
| **retire** | CH01-MCQ-0075 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH01-MCQ-0083 | authored-recall-v3.1 | For science vs technology, which statement is accurate? |
| **retire** | CH01-MCQ-0091 | authored-recall-v3.1-final | For the Grade 9 topic Science vs technology, which option gives the c... |

### Group 61 — Chapter 1 · Engineering connection

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH01-MCQ-0033 | original-seed | A chemical engineer uses established chemical principles to design a ... |
| **retire** | CH01-MCQ-0034 | concept-expansion | In the context of Engineering connection, a chemical engineer uses es... |
| **retire** | CH01-MCQ-0035 | concept-expansion | During a Grade 9 chemistry review, A chemical engineer uses establish... |
| **retire** | CH01-MCQ-0036 | concept-expansion | A chemistry teacher checks understanding of Engineering connection. A... |
| **retire** | CH01-MCQ-0037 | concept-expansion | Which option correctly answers this question about Engineering connec... |
| **retire** | CH01-MCQ-0038 | concept-expansion | A learner is revising Engineering connection. A chemical engineer use... |
| keep | CH01-MCQ-0065 | authored-expansion-v3.1 | A student is checking the concept of engineering connection. Which st... |
| **retire** | CH01-MCQ-0066 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH01-MCQ-0080 | authored-recall-v3.1 | For engineering connection, which statement is accurate? |
| **retire** | CH01-MCQ-0088 | authored-recall-v3.1-final | For the Grade 9 topic Engineering connection, which option gives the ... |

### Group 62 — Chapter 1 · Branch identification

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH01-MCQ-0046 | original-seed | A scientist investigates chemical processes in stars and interstellar... |
| **retire** | CH01-MCQ-0047 | concept-expansion | In the context of Branch identification, a scientist investigates che... |
| **retire** | CH01-MCQ-0048 | concept-expansion | During a Grade 9 chemistry review, A scientist investigates chemical ... |
| **retire** | CH01-MCQ-0049 | concept-expansion | A chemistry teacher checks understanding of Branch identification. A ... |
| **retire** | CH01-MCQ-0050 | concept-expansion | Which option correctly answers this question about Branch identificat... |
| **retire** | CH01-MCQ-0051 | concept-expansion | A learner is revising Branch identification. A scientist investigates... |
| keep | CH01-MCQ-0053 | authored-expansion-v3.1 | A student is checking the concept of branch identification. Which sta... |
| **retire** | CH01-MCQ-0054 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH01-MCQ-0076 | authored-recall-v3.1 | Which option correctly states the key fact about branch identification? |
| **retire** | CH01-MCQ-0084 | authored-recall-v3.1-final | For the Grade 9 topic Branch identification, which option gives the c... |

### Group 63 — Chapter 2 · States of matter

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH02-MCQ-0009 | original-seed | Which property is characteristic of a liquid compared with a solid? |
| **retire** | CH02-MCQ-0010 | concept-expansion | In the context of States of matter, which property is characteristic ... |
| **retire** | CH02-MCQ-0011 | concept-expansion | For the topic "States of matter", which property is characteristic of... |
| **retire** | CH02-MCQ-0012 | concept-expansion | During a Grade 9 chemistry review, Which property is characteristic o... |
| **retire** | CH02-MCQ-0013 | concept-expansion | A chemistry teacher checks understanding of States of matter. Which p... |
| **retire** | CH02-MCQ-0014 | concept-expansion | Which option correctly answers this question about States of matter? ... |
| **retire** | CH02-MCQ-0015 | concept-expansion | A learner is revising States of matter. Which property is characteris... |
| keep | CH02-MCQ-0114 | authored-expansion-v3.1 | A student is checking the concept of states of matter. Which statemen... |
| **retire** | CH02-MCQ-0115 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH02-MCQ-0123 | authored-recall-v3.1 | Which option correctly states the key fact about states of matter? |

### Group 64 — Chapter 2 · Allotropes

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH02-MCQ-0022 | original-seed | Diamond and graphite are examples of allotropes because they: |
| **retire** | CH02-MCQ-0023 | concept-expansion | In the context of Allotropes, diamond and graphite are examples of al... |
| **retire** | CH02-MCQ-0024 | concept-expansion | For the topic "Allotropes", diamond and graphite are examples of allo... |
| **retire** | CH02-MCQ-0025 | concept-expansion | During a Grade 9 chemistry review, Diamond and graphite are examples ... |
| **retire** | CH02-MCQ-0026 | concept-expansion | A chemistry teacher checks understanding of Allotropes. Diamond and g... |
| **retire** | CH02-MCQ-0027 | concept-expansion | Which option correctly answers this question about Allotropes? Diamon... |
| **retire** | CH02-MCQ-0028 | concept-expansion | A learner is revising Allotropes. Diamond and graphite are examples o... |
| keep | CH02-MCQ-0090 | authored-expansion-v3.1 | A student is checking the concept of allotropes. Which statement shou... |
| **retire** | CH02-MCQ-0091 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH02-MCQ-0116 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about allotropes? |

### Group 65 — Chapter 3 · Electron shells

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH03-MCQ-0009 | original-seed | In the textbook model, a shell farther from the nucleus generally rep... |
| **retire** | CH03-MCQ-0010 | concept-expansion | In the context of Electron shells, in the textbook model, a shell far... |
| **retire** | CH03-MCQ-0011 | concept-expansion | For the topic "Electron shells", in the textbook model, a shell farth... |
| **retire** | CH03-MCQ-0012 | concept-expansion | During a Grade 9 chemistry review, In the textbook model, a shell far... |
| **retire** | CH03-MCQ-0013 | concept-expansion | A chemistry teacher checks understanding of Electron shells. In the t... |
| **retire** | CH03-MCQ-0014 | concept-expansion | Which option correctly answers this question about Electron shells? I... |
| **retire** | CH03-MCQ-0015 | concept-expansion | A learner is revising Electron shells. In the textbook model, a shell... |
| keep | CH03-MCQ-0092 | authored-expansion-v3.1 | A student is checking the concept of electron shells. Which statement... |
| **retire** | CH03-MCQ-0093 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH03-MCQ-0115 | authored-recall-v3.1 | Which option correctly states the key fact about electron shells? |

### Group 66 — Chapter 3 · Atomic number

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH03-MCQ-0022 | original-seed | The atomic number of an element is equal to the number of: |
| **retire** | CH03-MCQ-0023 | concept-expansion | In the context of Atomic number, the atomic number of an element is e... |
| **retire** | CH03-MCQ-0024 | concept-expansion | For the topic "Atomic number", the atomic number of an element is equ... |
| **retire** | CH03-MCQ-0025 | concept-expansion | During a Grade 9 chemistry review, The atomic number of an element is... |
| **retire** | CH03-MCQ-0026 | concept-expansion | A chemistry teacher checks understanding of Atomic number. The atomic... |
| **retire** | CH03-MCQ-0027 | concept-expansion | Which option correctly answers this question about Atomic number? The... |
| **retire** | CH03-MCQ-0028 | concept-expansion | A learner is revising Atomic number. The atomic number of an element ... |
| keep | CH03-MCQ-0086 | authored-expansion-v3.1 | A student is checking the concept of atomic number. Which statement s... |
| **retire** | CH03-MCQ-0087 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH03-MCQ-0113 | authored-recall-v3.1 | For atomic number, which statement is accurate? |

### Group 67 — Chapter 3 · Isotopes

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH03-MCQ-0037 | original-seed | Two atoms are isotopes of the same element when they have: |
| **retire** | CH03-MCQ-0038 | concept-expansion | In the context of Isotopes, two atoms are isotopes of the same elemen... |
| **retire** | CH03-MCQ-0039 | concept-expansion | For the topic "Isotopes", two atoms are isotopes of the same element ... |
| **retire** | CH03-MCQ-0040 | concept-expansion | During a Grade 9 chemistry review, Two atoms are isotopes of the same... |
| **retire** | CH03-MCQ-0041 | concept-expansion | A chemistry teacher checks understanding of Isotopes. Two atoms are i... |
| **retire** | CH03-MCQ-0042 | concept-expansion | Which option correctly answers this question about Isotopes? Two atom... |
| **retire** | CH03-MCQ-0043 | concept-expansion | A learner is revising Isotopes. Two atoms are isotopes of the same el... |
| keep | CH03-MCQ-0101 | authored-expansion-v3.1 | A student is checking the concept of isotopes. Which statement should... |
| **retire** | CH03-MCQ-0102 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH03-MCQ-0117 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about isotopes? |

### Group 68 — Chapter 4 · Groups and periods

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH04-MCQ-0008 | original-seed | Elements in the same group generally have similar chemical properties... |
| **retire** | CH04-MCQ-0009 | concept-expansion | In the context of Groups and periods, elements in the same group gene... |
| **retire** | CH04-MCQ-0010 | concept-expansion | During a Grade 9 chemistry review, Elements in the same group general... |
| **retire** | CH04-MCQ-0011 | concept-expansion | A chemistry teacher checks understanding of Groups and periods. Eleme... |
| **retire** | CH04-MCQ-0012 | concept-expansion | Which option correctly answers this question about Groups and periods... |
| **retire** | CH04-MCQ-0013 | concept-expansion | A learner is revising Groups and periods. Elements in the same group ... |
| keep | CH04-MCQ-0061 | authored-expansion-v3.1 | A student is checking the concept of groups and periods. Which statem... |
| **retire** | CH04-MCQ-0062 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH04-MCQ-0082 | authored-recall-v3.1 | For groups and periods, which statement is accurate? |
| **retire** | CH04-MCQ-0090 | authored-recall-v3.1-final | For the Grade 9 topic Groups and periods, which option gives the corr... |

### Group 69 — Chapter 4 · Group I

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH04-MCQ-0021 | original-seed | An unknown element is a soft metal with one outer electron and reacts... |
| **retire** | CH04-MCQ-0022 | concept-expansion | In the context of Group I, an unknown element is a soft metal with on... |
| **retire** | CH04-MCQ-0023 | concept-expansion | During a Grade 9 chemistry review, An unknown element is a soft metal... |
| **retire** | CH04-MCQ-0024 | concept-expansion | A chemistry teacher checks understanding of Group I. An unknown eleme... |
| **retire** | CH04-MCQ-0025 | concept-expansion | Which option correctly answers this question about Group I? An unknow... |
| **retire** | CH04-MCQ-0026 | concept-expansion | A learner is revising Group I. An unknown element is a soft metal wit... |
| keep | CH04-MCQ-0058 | authored-expansion-v3.1 | A student is checking the concept of group i. Which statement should ... |
| **retire** | CH04-MCQ-0059 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH04-MCQ-0081 | authored-recall-v3.1 | Which option correctly states the key fact about group i? |
| **retire** | CH04-MCQ-0089 | authored-recall-v3.1-final | For the Grade 9 topic Group I, which option gives the correct chemica... |

### Group 70 — Chapter 5 · Bond types

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH05-MCQ-0001 | original-seed | Which bond involves electrostatic attraction between oppositely charg... |
| **retire** | CH05-MCQ-0002 | concept-expansion | In the context of Bond types, which bond involves electrostatic attra... |
| **retire** | CH05-MCQ-0003 | concept-expansion | For the topic "Bond types", which bond involves electrostatic attract... |
| **retire** | CH05-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, Which bond involves electrostatic ... |
| **retire** | CH05-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Bond types. Which bond in... |
| **retire** | CH05-MCQ-0006 | concept-expansion | Which option correctly answers this question about Bond types? Which ... |
| **retire** | CH05-MCQ-0007 | concept-expansion | A learner is revising Bond types. Which bond involves electrostatic a... |
| keep | CH05-MCQ-0084 | authored-expansion-v3.1 | A student is checking the concept of bond types. Which statement shou... |
| **retire** | CH05-MCQ-0085 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH05-MCQ-0111 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about bond types? |

### Group 71 — Chapter 5 · Covalent bonding

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH05-MCQ-0008 | original-seed | A covalent bond is best described as attraction involving: |
| **retire** | CH05-MCQ-0009 | concept-expansion | In the context of Covalent bonding, a covalent bond is best described... |
| **retire** | CH05-MCQ-0010 | concept-expansion | For the topic "Covalent bonding", a covalent bond is best described a... |
| **retire** | CH05-MCQ-0011 | concept-expansion | During a Grade 9 chemistry review, A covalent bond is best described ... |
| **retire** | CH05-MCQ-0012 | concept-expansion | A chemistry teacher checks understanding of Covalent bonding. A coval... |
| **retire** | CH05-MCQ-0013 | concept-expansion | Which option correctly answers this question about Covalent bonding? ... |
| **retire** | CH05-MCQ-0014 | concept-expansion | A learner is revising Covalent bonding. A covalent bond is best descr... |
| keep | CH05-MCQ-0093 | authored-expansion-v3.1 | A student is checking the concept of covalent bonding. Which statemen... |
| **retire** | CH05-MCQ-0094 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH05-MCQ-0113 | authored-recall-v3.1 | For covalent bonding, which statement is accurate? |

### Group 72 — Chapter 5 · Melting points

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH05-MCQ-0022 | original-seed | Why do many ionic compounds have high melting points? |
| **retire** | CH05-MCQ-0023 | concept-expansion | In the context of Melting points, why do many ionic compounds have hi... |
| **retire** | CH05-MCQ-0024 | concept-expansion | For the topic "Melting points", why do many ionic compounds have high... |
| **retire** | CH05-MCQ-0025 | concept-expansion | During a Grade 9 chemistry review, Why do many ionic compounds have h... |
| **retire** | CH05-MCQ-0026 | concept-expansion | A chemistry teacher checks understanding of Melting points. Why do ma... |
| **retire** | CH05-MCQ-0027 | concept-expansion | Which option correctly answers this question about Melting points? Wh... |
| **retire** | CH05-MCQ-0028 | concept-expansion | A learner is revising Melting points. Why do many ionic compounds hav... |
| keep | CH05-MCQ-0108 | authored-expansion-v3.1 | A student is checking the concept of melting points. Which statement ... |
| **retire** | CH05-MCQ-0109 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH05-MCQ-0117 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about melting points? |

### Group 73 — Chapter 5 · Electrical conduction

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH05-MCQ-0029 | original-seed | Solid sodium chloride does not conduct electricity well, but molten s... |
| **retire** | CH05-MCQ-0030 | concept-expansion | In the context of Electrical conduction, solid sodium chloride does n... |
| **retire** | CH05-MCQ-0031 | concept-expansion | During a Grade 9 chemistry review, Solid sodium chloride does not con... |
| **retire** | CH05-MCQ-0032 | concept-expansion | A chemistry teacher checks understanding of Electrical conduction. So... |
| **retire** | CH05-MCQ-0033 | concept-expansion | Which option correctly answers this question about Electrical conduct... |
| **retire** | CH05-MCQ-0034 | concept-expansion | A learner is revising Electrical conduction. Solid sodium chloride do... |
| keep | CH05-MCQ-0095 | authored-expansion-v3.1 | Which statement best describes electrical conduction? |
| **retire** | CH05-MCQ-0096 | authored-expansion-v3.1 | A learner is asked to identify the valid statement about electrical c... |
| **retire** | CH05-MCQ-0097 | authored-expansion-v3.1 | Which observation or statement would be consistent with electrical co... |
| **retire** | CH05-MCQ-0114 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about electrical co... |

### Group 74 — Chapter 5 · Graphite use

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH05-MCQ-0035 | original-seed | Graphite is suitable for some electrical electrodes mainly because it: |
| **retire** | CH05-MCQ-0036 | concept-expansion | In the context of Graphite use, graphite is suitable for some electri... |
| **retire** | CH05-MCQ-0037 | concept-expansion | For the topic "Graphite use", graphite is suitable for some electrica... |
| **retire** | CH05-MCQ-0038 | concept-expansion | During a Grade 9 chemistry review, Graphite is suitable for some elec... |
| **retire** | CH05-MCQ-0039 | concept-expansion | A chemistry teacher checks understanding of Graphite use. Graphite is... |
| **retire** | CH05-MCQ-0040 | concept-expansion | Which option correctly answers this question about Graphite use? Grap... |
| **retire** | CH05-MCQ-0041 | concept-expansion | A learner is revising Graphite use. Graphite is suitable for some ele... |
| keep | CH05-MCQ-0099 | authored-expansion-v3.1 | A student is checking the concept of graphite use. Which statement sh... |
| **retire** | CH05-MCQ-0100 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH05-MCQ-0115 | authored-recall-v3.1 | Which option correctly states the key fact about graphite use? |

### Group 75 — Chapter 5 · Lewis structures

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH05-MCQ-0042 | original-seed | Which molecule contains a double covalent bond between its carbon atoms? |
| **retire** | CH05-MCQ-0043 | concept-expansion | In the context of Lewis structures, which molecule contains a double ... |
| **retire** | CH05-MCQ-0044 | concept-expansion | For the topic "Lewis structures", which molecule contains a double co... |
| **retire** | CH05-MCQ-0045 | concept-expansion | During a Grade 9 chemistry review, Which molecule contains a double c... |
| **retire** | CH05-MCQ-0046 | concept-expansion | A chemistry teacher checks understanding of Lewis structures. Which m... |
| **retire** | CH05-MCQ-0047 | concept-expansion | Which option correctly answers this question about Lewis structures? ... |
| **retire** | CH05-MCQ-0048 | concept-expansion | A learner is revising Lewis structures. Which molecule contains a dou... |
| keep | CH05-MCQ-0105 | authored-expansion-v3.1 | A student is checking the concept of lewis structures. Which statemen... |
| **retire** | CH05-MCQ-0106 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH05-MCQ-0116 | authored-recall-v3.1 | For lewis structures, which statement is accurate? |

### Group 76 — Chapter 6 · Empirical formula

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH06-MCQ-0009 | original-seed | The empirical formula of a compound represents the: |
| **retire** | CH06-MCQ-0010 | concept-expansion | In the context of Empirical formula, the empirical formula of a compo... |
| **retire** | CH06-MCQ-0011 | concept-expansion | For the topic "Empirical formula", the empirical formula of a compoun... |
| **retire** | CH06-MCQ-0012 | concept-expansion | During a Grade 9 chemistry review, The empirical formula of a compoun... |
| **retire** | CH06-MCQ-0013 | concept-expansion | A chemistry teacher checks understanding of Empirical formula. The em... |
| **retire** | CH06-MCQ-0014 | concept-expansion | Which option correctly answers this question about Empirical formula?... |
| **retire** | CH06-MCQ-0015 | concept-expansion | A learner is revising Empirical formula. The empirical formula of a c... |
| keep | CH06-MCQ-0064 | authored-expansion-v3.1 | A student is checking the concept of empirical formula. Which stateme... |
| **retire** | CH06-MCQ-0065 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH06-MCQ-0085 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about empirical for... |

### Group 77 — Chapter 6 · Moles from mass

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH06-MCQ-0024 | original-seed | How many moles are present in 18 g of water if its molar mass is 18 g... |
| **retire** | CH06-MCQ-0025 | concept-expansion | In the context of Moles from mass, how many moles are present in 18 g... |
| **retire** | CH06-MCQ-0026 | concept-expansion | For the topic "Moles from mass", how many moles are present in 18 g o... |
| **retire** | CH06-MCQ-0027 | concept-expansion | During a Grade 9 chemistry review, How many moles are present in 18 g... |
| **retire** | CH06-MCQ-0028 | concept-expansion | A chemistry teacher checks understanding of Moles from mass. How many... |
| **retire** | CH06-MCQ-0029 | concept-expansion | Which option correctly answers this question about Moles from mass? H... |
| **retire** | CH06-MCQ-0030 | concept-expansion | A learner is revising Moles from mass. How many moles are present in ... |
| keep | CH06-MCQ-0079 | authored-expansion-v3.1 | A student is checking the concept of moles from mass. Which statement... |
| **retire** | CH06-MCQ-0080 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH06-MCQ-0090 | authored-recall-v3.1 | For moles from mass, which statement is accurate? |

### Group 78 — Chapter 6 · Particles from moles

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH06-MCQ-0031 | original-seed | The number of molecules in 2 mol of a molecular substance is approxim... |
| **retire** | CH06-MCQ-0032 | concept-expansion | In the context of Particles from moles, the number of molecules in 2 ... |
| **retire** | CH06-MCQ-0033 | concept-expansion | For the topic "Particles from moles", the number of molecules in 2 mo... |
| **retire** | CH06-MCQ-0034 | concept-expansion | During a Grade 9 chemistry review, The number of molecules in 2 mol o... |
| **retire** | CH06-MCQ-0035 | concept-expansion | A chemistry teacher checks understanding of Particles from moles. The... |
| **retire** | CH06-MCQ-0036 | concept-expansion | Which option correctly answers this question about Particles from mol... |
| **retire** | CH06-MCQ-0037 | concept-expansion | A learner is revising Particles from moles. The number of molecules i... |
| keep | CH06-MCQ-0082 | authored-expansion-v3.1 | A student is checking the concept of particles from moles. Which stat... |
| **retire** | CH06-MCQ-0083 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH06-MCQ-0091 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about particles fro... |

### Group 79 — Chapter 6 · Ionic equation

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH06-MCQ-0046 | original-seed | For Zn(s) + Cu²⁺(aq) → Cu(s) + Zn²⁺(aq), which statement is correct? |
| **retire** | CH06-MCQ-0047 | concept-expansion | In the context of Ionic equation, for Zn(s) + Cu²⁺(aq) → Cu(s) + Zn²⁺... |
| **retire** | CH06-MCQ-0048 | concept-expansion | For the topic "Ionic equation", for Zn(s) + Cu²⁺(aq) → Cu(s) + Zn²⁺(a... |
| **retire** | CH06-MCQ-0049 | concept-expansion | During a Grade 9 chemistry review, For Zn(s) + Cu²⁺(aq) → Cu(s) + Zn²... |
| **retire** | CH06-MCQ-0050 | concept-expansion | A chemistry teacher checks understanding of Ionic equation. For Zn(s)... |
| **retire** | CH06-MCQ-0051 | concept-expansion | Which option correctly answers this question about Ionic equation? Fo... |
| **retire** | CH06-MCQ-0052 | concept-expansion | A learner is revising Ionic equation. For Zn(s) + Cu²⁺(aq) → Cu(s) + ... |
| keep | CH06-MCQ-0070 | authored-expansion-v3.1 | A student is checking the concept of ionic equation. Which statement ... |
| **retire** | CH06-MCQ-0071 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH06-MCQ-0087 | authored-recall-v3.1 | For ionic equation, which statement is accurate? |

### Group 80 — Chapter 6 · Formula deduction

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH06-MCQ-0053 | original-seed | What is the empirical formula of a compound with molecular formula C₆... |
| **retire** | CH06-MCQ-0054 | concept-expansion | In the context of Formula deduction, what is the empirical formula of... |
| **retire** | CH06-MCQ-0055 | concept-expansion | For the topic "Formula deduction", what is the empirical formula of a... |
| **retire** | CH06-MCQ-0056 | concept-expansion | During a Grade 9 chemistry review, What is the empirical formula of a... |
| **retire** | CH06-MCQ-0057 | concept-expansion | A chemistry teacher checks understanding of Formula deduction. What i... |
| **retire** | CH06-MCQ-0058 | concept-expansion | Which option correctly answers this question about Formula deduction?... |
| **retire** | CH06-MCQ-0059 | concept-expansion | A learner is revising Formula deduction. What is the empirical formul... |
| keep | CH06-MCQ-0067 | authored-expansion-v3.1 | A student is checking the concept of formula deduction. Which stateme... |
| **retire** | CH06-MCQ-0068 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH06-MCQ-0086 | authored-recall-v3.1 | Which option correctly states the key fact about formula deduction? |

### Group 81 — Chapter 7 · Oxidation number

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH07-MCQ-0017 | original-seed | The oxidation number of an element in its free elemental state is: |
| **retire** | CH07-MCQ-0018 | concept-expansion | In the context of Oxidation number, the oxidation number of an elemen... |
| **retire** | CH07-MCQ-0019 | concept-expansion | For the topic "Oxidation number", the oxidation number of an element ... |
| **retire** | CH07-MCQ-0020 | concept-expansion | During a Grade 9 chemistry review, The oxidation number of an element... |
| **retire** | CH07-MCQ-0021 | concept-expansion | A chemistry teacher checks understanding of Oxidation number. The oxi... |
| **retire** | CH07-MCQ-0022 | concept-expansion | Which option correctly answers this question about Oxidation number? ... |
| **retire** | CH07-MCQ-0023 | concept-expansion | A learner is revising Oxidation number. The oxidation number of an el... |
| keep | CH07-MCQ-0074 | authored-expansion-v3.1 | A student is checking the concept of oxidation number. Which statemen... |
| **retire** | CH07-MCQ-0075 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH07-MCQ-0089 | authored-recall-v3.1 | For oxidation number, which statement is accurate? |

### Group 82 — Chapter 7 · Monatomic ion

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH07-MCQ-0024 | original-seed | The oxidation number of a monatomic ion is equal to its: |
| **retire** | CH07-MCQ-0025 | concept-expansion | In the context of Monatomic ion, the oxidation number of a monatomic ... |
| **retire** | CH07-MCQ-0026 | concept-expansion | For the topic "Monatomic ion", the oxidation number of a monatomic io... |
| **retire** | CH07-MCQ-0027 | concept-expansion | During a Grade 9 chemistry review, The oxidation number of a monatomi... |
| **retire** | CH07-MCQ-0028 | concept-expansion | A chemistry teacher checks understanding of Monatomic ion. The oxidat... |
| **retire** | CH07-MCQ-0029 | concept-expansion | Which option correctly answers this question about Monatomic ion? The... |
| **retire** | CH07-MCQ-0030 | concept-expansion | A learner is revising Monatomic ion. The oxidation number of a monato... |
| keep | CH07-MCQ-0068 | authored-expansion-v3.1 | A student is checking the concept of monatomic ion. Which statement s... |
| **retire** | CH07-MCQ-0069 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH07-MCQ-0087 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about monatomic ion? |

### Group 83 — Chapter 7 · Oxidizing agent

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH07-MCQ-0031 | original-seed | In a redox reaction, the oxidizing agent is the species that: |
| **retire** | CH07-MCQ-0032 | concept-expansion | In the context of Oxidizing agent, in a redox reaction, the oxidizing... |
| **retire** | CH07-MCQ-0033 | concept-expansion | For the topic "Oxidizing agent", in a redox reaction, the oxidizing a... |
| **retire** | CH07-MCQ-0034 | concept-expansion | During a Grade 9 chemistry review, In a redox reaction, the oxidizing... |
| **retire** | CH07-MCQ-0035 | concept-expansion | A chemistry teacher checks understanding of Oxidizing agent. In a red... |
| **retire** | CH07-MCQ-0036 | concept-expansion | Which option correctly answers this question about Oxidizing agent? I... |
| **retire** | CH07-MCQ-0037 | concept-expansion | A learner is revising Oxidizing agent. In a redox reaction, the oxidi... |
| keep | CH07-MCQ-0080 | authored-expansion-v3.1 | A student is checking the concept of oxidizing agent. Which statement... |
| **retire** | CH07-MCQ-0081 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH07-MCQ-0091 | authored-recall-v3.1 | Which option correctly states the key fact about oxidizing agent? |

### Group 84 — Chapter 7 · Oxidation-number sum

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH07-MCQ-0054 | original-seed | In a neutral compound, the algebraic sum of oxidation numbers of all ... |
| **retire** | CH07-MCQ-0055 | concept-expansion | In the context of Oxidation-number sum, in a neutral compound, the al... |
| **retire** | CH07-MCQ-0056 | concept-expansion | For the topic "Oxidation-number sum", in a neutral compound, the alge... |
| **retire** | CH07-MCQ-0057 | concept-expansion | During a Grade 9 chemistry review, In a neutral compound, the algebra... |
| **retire** | CH07-MCQ-0058 | concept-expansion | A chemistry teacher checks understanding of Oxidation-number sum. In ... |
| **retire** | CH07-MCQ-0059 | concept-expansion | Which option correctly answers this question about Oxidation-number s... |
| **retire** | CH07-MCQ-0060 | concept-expansion | A learner is revising Oxidation-number sum. In a neutral compound, th... |
| keep | CH07-MCQ-0077 | authored-expansion-v3.1 | A student is checking the concept of oxidation-number sum. Which stat... |
| **retire** | CH07-MCQ-0078 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH07-MCQ-0090 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about oxidation-num... |

### Group 85 — Chapter 8 · Chemical system

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH08-MCQ-0001 | original-seed | In thermochemistry, the part of the universe being studied is called ... |
| **retire** | CH08-MCQ-0002 | concept-expansion | In the context of Chemical system, in thermochemistry, the part of th... |
| **retire** | CH08-MCQ-0003 | concept-expansion | For the topic "Chemical system", in thermochemistry, the part of the ... |
| **retire** | CH08-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, In thermochemistry, the part of th... |
| **retire** | CH08-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Chemical system. In therm... |
| **retire** | CH08-MCQ-0006 | concept-expansion | Which option correctly answers this question about Chemical system? I... |
| **retire** | CH08-MCQ-0007 | concept-expansion | A learner is revising Chemical system. In thermochemistry, the part o... |
| keep | CH08-MCQ-0076 | authored-expansion-v3.1 | A student is checking the concept of chemical system. Which statement... |
| **retire** | CH08-MCQ-0077 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH08-MCQ-0089 | authored-recall-v3.1 | For chemical system, which statement is accurate? |

### Group 86 — Chapter 8 · Exothermic reaction

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH08-MCQ-0008 | original-seed | For an exothermic reaction, the enthalpy change ΔH is generally: |
| **retire** | CH08-MCQ-0009 | concept-expansion | In the context of Exothermic reaction, for an exothermic reaction, th... |
| **retire** | CH08-MCQ-0010 | concept-expansion | For the topic "Exothermic reaction", for an exothermic reaction, the ... |
| **retire** | CH08-MCQ-0011 | concept-expansion | During a Grade 9 chemistry review, For an exothermic reaction, the en... |
| **retire** | CH08-MCQ-0012 | concept-expansion | A chemistry teacher checks understanding of Exothermic reaction. For ... |
| **retire** | CH08-MCQ-0013 | concept-expansion | Which option correctly answers this question about Exothermic reactio... |
| **retire** | CH08-MCQ-0014 | concept-expansion | A learner is revising Exothermic reaction. For an exothermic reaction... |
| keep | CH08-MCQ-0082 | authored-expansion-v3.1 | A student is checking the concept of exothermic reaction. Which state... |
| **retire** | CH08-MCQ-0083 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH08-MCQ-0091 | authored-recall-v3.1 | Which option correctly states the key fact about exothermic reaction? |

### Group 87 — Chapter 8 · Activation energy

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH08-MCQ-0023 | original-seed | Activation energy is the minimum energy needed for particles to: |
| **retire** | CH08-MCQ-0024 | concept-expansion | In the context of Activation energy, activation energy is the minimum... |
| **retire** | CH08-MCQ-0025 | concept-expansion | For the topic "Activation energy", activation energy is the minimum e... |
| **retire** | CH08-MCQ-0026 | concept-expansion | During a Grade 9 chemistry review, Activation energy is the minimum e... |
| **retire** | CH08-MCQ-0027 | concept-expansion | A chemistry teacher checks understanding of Activation energy. Activa... |
| **retire** | CH08-MCQ-0028 | concept-expansion | Which option correctly answers this question about Activation energy?... |
| **retire** | CH08-MCQ-0029 | concept-expansion | A learner is revising Activation energy. Activation energy is the min... |
| keep | CH08-MCQ-0061 | authored-expansion-v3.1 | A student is checking the concept of activation energy. Which stateme... |
| **retire** | CH08-MCQ-0062 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH08-MCQ-0084 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about activation en... |

### Group 88 — Chapter 9 · Temperature effect

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH09-MCQ-0024 | original-seed | A hydrated salt loses water on heating and the reverse process occurs... |
| **retire** | CH09-MCQ-0025 | concept-expansion | In the context of Temperature effect, a hydrated salt loses water on ... |
| **retire** | CH09-MCQ-0026 | concept-expansion | During a Grade 9 chemistry review, A hydrated salt loses water on hea... |
| **retire** | CH09-MCQ-0027 | concept-expansion | A chemistry teacher checks understanding of Temperature effect. A hyd... |
| **retire** | CH09-MCQ-0028 | concept-expansion | Which option correctly answers this question about Temperature effect... |
| **retire** | CH09-MCQ-0029 | concept-expansion | A learner is revising Temperature effect. A hydrated salt loses water... |
| keep | CH09-MCQ-0078 | authored-expansion-v3.1 | A student is checking the concept of temperature effect. Which statem... |
| **retire** | CH09-MCQ-0079 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH09-MCQ-0087 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about temperature e... |
| **retire** | CH09-MCQ-0095 | authored-recall-v3.1-final | For the Grade 9 topic Temperature effect, which option gives the corr... |

### Group 89 — Chapter 9 · Condition change

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH09-MCQ-0044 | original-seed | If water vapour is removed from a reversible dehydration system, the ... |
| **retire** | CH09-MCQ-0045 | concept-expansion | In the context of Condition change, if water vapour is removed from a... |
| **retire** | CH09-MCQ-0046 | concept-expansion | During a Grade 9 chemistry review, If water vapour is removed from a ... |
| **retire** | CH09-MCQ-0047 | concept-expansion | A chemistry teacher checks understanding of Condition change. If wate... |
| **retire** | CH09-MCQ-0048 | concept-expansion | Which option correctly answers this question about Condition change? ... |
| **retire** | CH09-MCQ-0049 | concept-expansion | A learner is revising Condition change. If water vapour is removed fr... |
| keep | CH09-MCQ-0057 | authored-expansion-v3.1 | A student is checking the concept of condition change. Which statemen... |
| **retire** | CH09-MCQ-0058 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH09-MCQ-0080 | authored-recall-v3.1 | For condition change, which statement is accurate? |
| **retire** | CH09-MCQ-0088 | authored-recall-v3.1-final | For the Grade 9 topic Condition change, which option gives the correc... |

### Group 90 — Chapter 9 · Equilibrium interpretation

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH09-MCQ-0050 | original-seed | A student observes no visible change in an equilibrium mixture. The b... |
| **retire** | CH09-MCQ-0051 | concept-expansion | In the context of Equilibrium interpretation, a student observes no v... |
| **retire** | CH09-MCQ-0052 | concept-expansion | During a Grade 9 chemistry review, A student observes no visible chan... |
| **retire** | CH09-MCQ-0053 | concept-expansion | A chemistry teacher checks understanding of Equilibrium interpretatio... |
| **retire** | CH09-MCQ-0054 | concept-expansion | Which option correctly answers this question about Equilibrium interp... |
| **retire** | CH09-MCQ-0055 | concept-expansion | A learner is revising Equilibrium interpretation. A student observes ... |
| keep | CH09-MCQ-0066 | authored-expansion-v3.1 | A student is checking the concept of equilibrium interpretation. Whic... |
| **retire** | CH09-MCQ-0067 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH09-MCQ-0083 | authored-recall-v3.1 | For equilibrium interpretation, which statement is accurate? |
| **retire** | CH09-MCQ-0091 | authored-recall-v3.1-final | For the Grade 9 topic Equilibrium interpretation, which option gives ... |

### Group 91 — Chapter 10 · Acid dissociation

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH10-MCQ-0024 | original-seed | Which equation represents the dissociation of hydrochloric acid in wa... |
| **retire** | CH10-MCQ-0025 | concept-expansion | In the context of Acid dissociation, which equation represents the di... |
| **retire** | CH10-MCQ-0026 | concept-expansion | For the topic "Acid dissociation", which equation represents the diss... |
| **retire** | CH10-MCQ-0027 | concept-expansion | During a Grade 9 chemistry review, Which equation represents the diss... |
| **retire** | CH10-MCQ-0028 | concept-expansion | A chemistry teacher checks understanding of Acid dissociation. Which ... |
| **retire** | CH10-MCQ-0029 | concept-expansion | Which option correctly answers this question about Acid dissociation?... |
| **retire** | CH10-MCQ-0030 | concept-expansion | A learner is revising Acid dissociation. Which equation represents th... |
| keep | CH10-MCQ-0087 | authored-expansion-v3.1 | A student is checking the concept of acid dissociation. Which stateme... |
| **retire** | CH10-MCQ-0088 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH10-MCQ-0114 | authored-recall-v3.1 | Which option correctly states the key fact about acid dissociation? |

### Group 92 — Chapter 10 · Acid-base reactions

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH10-MCQ-0039 | original-seed | A typical reaction between an acid and a metal carbonate produces: |
| **retire** | CH10-MCQ-0040 | concept-expansion | In the context of Acid-base reactions, a typical reaction between an ... |
| **retire** | CH10-MCQ-0041 | concept-expansion | For the topic "Acid-base reactions", a typical reaction between an ac... |
| **retire** | CH10-MCQ-0042 | concept-expansion | During a Grade 9 chemistry review, A typical reaction between an acid... |
| **retire** | CH10-MCQ-0043 | concept-expansion | A chemistry teacher checks understanding of Acid-base reactions. A ty... |
| **retire** | CH10-MCQ-0044 | concept-expansion | Which option correctly answers this question about Acid-base reaction... |
| **retire** | CH10-MCQ-0045 | concept-expansion | A learner is revising Acid-base reactions. A typical reaction between... |
| keep | CH10-MCQ-0093 | authored-expansion-v3.1 | A student is checking the concept of acid-base reactions. Which state... |
| **retire** | CH10-MCQ-0094 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH10-MCQ-0116 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about acid-base rea... |

### Group 93 — Chapter 10 · Acid rain

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH10-MCQ-0052 | original-seed | Acid rain can damage limestone because acids react with: |
| **retire** | CH10-MCQ-0053 | concept-expansion | In the context of Acid rain, acid rain can damage limestone because a... |
| **retire** | CH10-MCQ-0054 | concept-expansion | For the topic "Acid rain", acid rain can damage limestone because aci... |
| **retire** | CH10-MCQ-0055 | concept-expansion | During a Grade 9 chemistry review, Acid rain can damage limestone bec... |
| **retire** | CH10-MCQ-0056 | concept-expansion | A chemistry teacher checks understanding of Acid rain. Acid rain can ... |
| **retire** | CH10-MCQ-0057 | concept-expansion | Which option correctly answers this question about Acid rain? Acid ra... |
| **retire** | CH10-MCQ-0058 | concept-expansion | A learner is revising Acid rain. Acid rain can damage limestone becau... |
| keep | CH10-MCQ-0090 | authored-expansion-v3.1 | A student is checking the concept of acid rain. Which statement shoul... |
| **retire** | CH10-MCQ-0091 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH10-MCQ-0115 | authored-recall-v3.1 | For acid rain, which statement is accurate? |

### Group 94 — Chapter 11 · Catalytic converter

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH11-MCQ-0042 | original-seed | A catalytic converter helps reduce harmful vehicle emissions by promo... |
| **retire** | CH11-MCQ-0043 | concept-expansion | In the context of Catalytic converter, a catalytic converter helps re... |
| **retire** | CH11-MCQ-0044 | concept-expansion | During a Grade 9 chemistry review, A catalytic converter helps reduce... |
| **retire** | CH11-MCQ-0045 | concept-expansion | A chemistry teacher checks understanding of Catalytic converter. A ca... |
| **retire** | CH11-MCQ-0046 | concept-expansion | Which option correctly answers this question about Catalytic converte... |
| **retire** | CH11-MCQ-0047 | concept-expansion | A learner is revising Catalytic converter. A catalytic converter help... |
| keep | CH11-MCQ-0065 | authored-expansion-v3.1 | A student is checking the concept of catalytic converter. Which state... |
| **retire** | CH11-MCQ-0066 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH11-MCQ-0080 | authored-recall-v3.1 | Which option correctly states the key fact about catalytic converter? |
| **retire** | CH11-MCQ-0088 | authored-recall-v3.1-final | For the Grade 9 topic Catalytic converter, which option gives the cor... |

### Group 95 — Chapter 12 · Natural water

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH12-MCQ-0001 | original-seed | Which substance can be naturally present in water and is beneficial t... |
| **retire** | CH12-MCQ-0002 | concept-expansion | In the context of Natural water, which substance can be naturally pre... |
| **retire** | CH12-MCQ-0003 | concept-expansion | For the topic "Natural water", which substance can be naturally prese... |
| **retire** | CH12-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, Which substance can be naturally p... |
| **retire** | CH12-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Natural water. Which subs... |
| **retire** | CH12-MCQ-0006 | concept-expansion | Which option correctly answers this question about Natural water? Whi... |
| **retire** | CH12-MCQ-0007 | concept-expansion | A learner is revising Natural water. Which substance can be naturally... |
| keep | CH12-MCQ-0072 | authored-expansion-v3.1 | A student is checking the concept of natural water. Which statement s... |
| **retire** | CH12-MCQ-0073 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH12-MCQ-0087 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about natural water? |

### Group 96 — Chapter 12 · Water pollutants

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH12-MCQ-0008 | original-seed | Excess nitrates and phosphates entering water can contribute to: |
| **retire** | CH12-MCQ-0009 | concept-expansion | In the context of Water pollutants, excess nitrates and phosphates en... |
| **retire** | CH12-MCQ-0010 | concept-expansion | For the topic "Water pollutants", excess nitrates and phosphates ente... |
| **retire** | CH12-MCQ-0011 | concept-expansion | During a Grade 9 chemistry review, Excess nitrates and phosphates ent... |
| **retire** | CH12-MCQ-0012 | concept-expansion | A chemistry teacher checks understanding of Water pollutants. Excess ... |
| **retire** | CH12-MCQ-0013 | concept-expansion | Which option correctly answers this question about Water pollutants? ... |
| **retire** | CH12-MCQ-0014 | concept-expansion | A learner is revising Water pollutants. Excess nitrates and phosphate... |
| keep | CH12-MCQ-0075 | authored-expansion-v3.1 | A student is checking the concept of water pollutants. Which statemen... |
| **retire** | CH12-MCQ-0076 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH12-MCQ-0088 | authored-recall-v3.1 | Which option correctly states the key fact about water pollutants? |

### Group 97 — Chapter 12 · Water-borne disease

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH12-MCQ-0029 | original-seed | A practical way to reduce water-borne disease is to: |
| **retire** | CH12-MCQ-0030 | concept-expansion | In the context of Water-borne disease, a practical way to reduce wate... |
| **retire** | CH12-MCQ-0031 | concept-expansion | For the topic "Water-borne disease", a practical way to reduce water-... |
| **retire** | CH12-MCQ-0032 | concept-expansion | During a Grade 9 chemistry review, A practical way to reduce water-bo... |
| **retire** | CH12-MCQ-0033 | concept-expansion | A chemistry teacher checks understanding of Water-borne disease. A pr... |
| **retire** | CH12-MCQ-0034 | concept-expansion | Which option correctly answers this question about Water-borne diseas... |
| **retire** | CH12-MCQ-0035 | concept-expansion | A learner is revising Water-borne disease. A practical way to reduce ... |
| keep | CH12-MCQ-0081 | authored-expansion-v3.1 | A student is checking the concept of water-borne disease. Which state... |
| **retire** | CH12-MCQ-0082 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH12-MCQ-0090 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about water-borne d... |

### Group 98 — Chapter 12 · Water scarcity

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH12-MCQ-0036 | original-seed | Which action can help reduce pressure caused by water scarcity? |
| **retire** | CH12-MCQ-0037 | concept-expansion | In the context of Water scarcity, which action can help reduce pressu... |
| **retire** | CH12-MCQ-0038 | concept-expansion | For the topic "Water scarcity", which action can help reduce pressure... |
| **retire** | CH12-MCQ-0039 | concept-expansion | During a Grade 9 chemistry review, Which action can help reduce press... |
| **retire** | CH12-MCQ-0040 | concept-expansion | A chemistry teacher checks understanding of Water scarcity. Which act... |
| **retire** | CH12-MCQ-0041 | concept-expansion | Which option correctly answers this question about Water scarcity? Wh... |
| **retire** | CH12-MCQ-0042 | concept-expansion | A learner is revising Water scarcity. Which action can help reduce pr... |
| keep | CH12-MCQ-0078 | authored-expansion-v3.1 | A student is checking the concept of water scarcity. Which statement ... |
| **retire** | CH12-MCQ-0079 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH12-MCQ-0089 | authored-recall-v3.1 | For water scarcity, which statement is accurate? |

### Group 99 — Chapter 13 · Organic structures

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH13-MCQ-0001 | original-seed | An organic molecule with carbon atoms arranged in a ring is described... |
| **retire** | CH13-MCQ-0002 | concept-expansion | In the context of Organic structures, an organic molecule with carbon... |
| **retire** | CH13-MCQ-0003 | concept-expansion | For the topic "Organic structures", an organic molecule with carbon a... |
| **retire** | CH13-MCQ-0004 | concept-expansion | During a Grade 9 chemistry review, An organic molecule with carbon at... |
| **retire** | CH13-MCQ-0005 | concept-expansion | A chemistry teacher checks understanding of Organic structures. An or... |
| **retire** | CH13-MCQ-0006 | concept-expansion | Which option correctly answers this question about Organic structures... |
| **retire** | CH13-MCQ-0007 | concept-expansion | A learner is revising Organic structures. An organic molecule with ca... |
| keep | CH13-MCQ-0110 | authored-expansion-v3.1 | A student is checking the concept of organic structures. Which statem... |
| **retire** | CH13-MCQ-0111 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH13-MCQ-0125 | authored-recall-v3.1 | Which option correctly states the key fact about organic structures? |

### Group 100 — Chapter 13 · Functional group

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH13-MCQ-0024 | original-seed | A functional group is important because it largely determines the: |
| **retire** | CH13-MCQ-0025 | concept-expansion | In the context of Functional group, a functional group is important b... |
| **retire** | CH13-MCQ-0026 | concept-expansion | For the topic "Functional group", a functional group is important bec... |
| **retire** | CH13-MCQ-0027 | concept-expansion | During a Grade 9 chemistry review, A functional group is important be... |
| **retire** | CH13-MCQ-0028 | concept-expansion | A chemistry teacher checks understanding of Functional group. A funct... |
| **retire** | CH13-MCQ-0029 | concept-expansion | Which option correctly answers this question about Functional group? ... |
| **retire** | CH13-MCQ-0030 | concept-expansion | A learner is revising Functional group. A functional group is importa... |
| keep | CH13-MCQ-0095 | authored-expansion-v3.1 | A student is checking the concept of functional group. Which statemen... |
| **retire** | CH13-MCQ-0096 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH13-MCQ-0120 | authored-recall-v3.1 | For functional group, which statement is accurate? |

### Group 101 — Chapter 13 · Homologous series

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH13-MCQ-0038 | original-seed | Successive members of a homologous series generally differ by: |
| **retire** | CH13-MCQ-0039 | concept-expansion | In the context of Homologous series, successive members of a homologo... |
| **retire** | CH13-MCQ-0040 | concept-expansion | For the topic "Homologous series", successive members of a homologous... |
| **retire** | CH13-MCQ-0041 | concept-expansion | During a Grade 9 chemistry review, Successive members of a homologous... |
| **retire** | CH13-MCQ-0042 | concept-expansion | A chemistry teacher checks understanding of Homologous series. Succes... |
| **retire** | CH13-MCQ-0043 | concept-expansion | Which option correctly answers this question about Homologous series?... |
| **retire** | CH13-MCQ-0044 | concept-expansion | A learner is revising Homologous series. Successive members of a homo... |
| keep | CH13-MCQ-0101 | authored-expansion-v3.1 | A student is checking the concept of homologous series. Which stateme... |
| **retire** | CH13-MCQ-0102 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH13-MCQ-0122 | authored-recall-v3.1 | Which option correctly states the key fact about homologous series? |

### Group 102 — Chapter 13 · Isomers

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH13-MCQ-0053 | original-seed | Two compounds with the same molecular formula but different structura... |
| **retire** | CH13-MCQ-0054 | concept-expansion | In the context of Isomers, two compounds with the same molecular form... |
| **retire** | CH13-MCQ-0055 | concept-expansion | For the topic "Isomers", two compounds with the same molecular formul... |
| **retire** | CH13-MCQ-0056 | concept-expansion | During a Grade 9 chemistry review, Two compounds with the same molecu... |
| **retire** | CH13-MCQ-0057 | concept-expansion | A chemistry teacher checks understanding of Isomers. Two compounds wi... |
| **retire** | CH13-MCQ-0058 | concept-expansion | Which option correctly answers this question about Isomers? Two compo... |
| **retire** | CH13-MCQ-0059 | concept-expansion | A learner is revising Isomers. Two compounds with the same molecular ... |
| keep | CH13-MCQ-0107 | authored-expansion-v3.1 | A student is checking the concept of isomers. Which statement should ... |
| **retire** | CH13-MCQ-0108 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH13-MCQ-0124 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about isomers? |

### Group 103 — Chapter 14 · Unsaturated compounds

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH14-MCQ-0009 | original-seed | An unsaturated hydrocarbon contains at least one: |
| **retire** | CH14-MCQ-0010 | concept-expansion | In the context of Unsaturated compounds, an unsaturated hydrocarbon c... |
| **retire** | CH14-MCQ-0011 | concept-expansion | For the topic "Unsaturated compounds", an unsaturated hydrocarbon con... |
| **retire** | CH14-MCQ-0012 | concept-expansion | During a Grade 9 chemistry review, An unsaturated hydrocarbon contain... |
| **retire** | CH14-MCQ-0013 | concept-expansion | A chemistry teacher checks understanding of Unsaturated compounds. An... |
| **retire** | CH14-MCQ-0014 | concept-expansion | Which option correctly answers this question about Unsaturated compou... |
| **retire** | CH14-MCQ-0015 | concept-expansion | A learner is revising Unsaturated compounds. An unsaturated hydrocarb... |
| keep | CH14-MCQ-0083 | authored-expansion-v3.1 | A student is checking the concept of unsaturated compounds. Which sta... |
| **retire** | CH14-MCQ-0084 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH14-MCQ-0092 | authored-recall-v3.1 | Which option correctly states the key fact about unsaturated compounds? |

### Group 104 — Chapter 14 · Substitution

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH14-MCQ-0032 | original-seed | In a substitution reaction, one atom or group of atoms is: |
| **retire** | CH14-MCQ-0033 | concept-expansion | In the context of Substitution, in a substitution reaction, one atom ... |
| **retire** | CH14-MCQ-0034 | concept-expansion | For the topic "Substitution", in a substitution reaction, one atom or... |
| **retire** | CH14-MCQ-0035 | concept-expansion | During a Grade 9 chemistry review, In a substitution reaction, one at... |
| **retire** | CH14-MCQ-0036 | concept-expansion | A chemistry teacher checks understanding of Substitution. In a substi... |
| **retire** | CH14-MCQ-0037 | concept-expansion | Which option correctly answers this question about Substitution? In a... |
| **retire** | CH14-MCQ-0038 | concept-expansion | A learner is revising Substitution. In a substitution reaction, one a... |
| keep | CH14-MCQ-0080 | authored-expansion-v3.1 | A student is checking the concept of substitution. Which statement sh... |
| **retire** | CH14-MCQ-0081 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH14-MCQ-0091 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about substitution? |

### Group 105 — Chapter 15 · Proteins

10 members · 2 keep · 8 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH15-MCQ-0024 | original-seed | Proteins are especially important because they contribute to: |
| **retire** | CH15-MCQ-0025 | concept-expansion | In the context of Proteins, proteins are especially important because... |
| **retire** | CH15-MCQ-0026 | concept-expansion | For the topic "Proteins", proteins are especially important because t... |
| **retire** | CH15-MCQ-0027 | concept-expansion | During a Grade 9 chemistry review, Proteins are especially important ... |
| **retire** | CH15-MCQ-0028 | concept-expansion | A chemistry teacher checks understanding of Proteins. Proteins are es... |
| **retire** | CH15-MCQ-0029 | concept-expansion | Which option correctly answers this question about Proteins? Proteins... |
| **retire** | CH15-MCQ-0030 | concept-expansion | A learner is revising Proteins. Proteins are especially important bec... |
| keep | CH15-MCQ-0083 | authored-expansion-v3.1 | A student is checking the concept of proteins. Which statement should... |
| **retire** | CH15-MCQ-0084 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH15-MCQ-0095 | authored-recall-v3.1-final | For the Grade 9 topic Proteins, which option gives the correct chemic... |

### Group 106 — Chapter 2 · Plasma

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH02-MCQ-0016 | original-seed | Which state of matter is commonly associated with ionized gas in star... |
| **retire** | CH02-MCQ-0017 | concept-expansion | In the context of Plasma, which state of matter is commonly associate... |
| **retire** | CH02-MCQ-0018 | concept-expansion | During a Grade 9 chemistry review, Which state of matter is commonly ... |
| **retire** | CH02-MCQ-0019 | concept-expansion | A chemistry teacher checks understanding of Plasma. Which state of ma... |
| **retire** | CH02-MCQ-0020 | concept-expansion | Which option correctly answers this question about Plasma? Which stat... |
| **retire** | CH02-MCQ-0021 | concept-expansion | A learner is revising Plasma. Which state of matter is commonly assoc... |
| keep | CH02-MCQ-0102 | authored-expansion-v3.1 | A student is checking the concept of plasma. Which statement should b... |
| **retire** | CH02-MCQ-0103 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH02-MCQ-0120 | authored-recall-v3.1 | Which option correctly states the key fact about plasma? |

### Group 107 — Chapter 2 · Solubility

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH02-MCQ-0045 | original-seed | A solid solute dissolves more readily as the temperature of the solve... |
| **retire** | CH02-MCQ-0046 | concept-expansion | In the context of Solubility, a solid solute dissolves more readily a... |
| **retire** | CH02-MCQ-0047 | concept-expansion | During a Grade 9 chemistry review, A solid solute dissolves more read... |
| **retire** | CH02-MCQ-0048 | concept-expansion | A chemistry teacher checks understanding of Solubility. A solid solut... |
| **retire** | CH02-MCQ-0049 | concept-expansion | Which option correctly answers this question about Solubility? A soli... |
| **retire** | CH02-MCQ-0050 | concept-expansion | A learner is revising Solubility. A solid solute dissolves more readi... |
| keep | CH02-MCQ-0108 | authored-expansion-v3.1 | A student is checking the concept of solubility. Which statement shou... |
| **retire** | CH02-MCQ-0109 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH02-MCQ-0122 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about solubility? |

### Group 108 — Chapter 2 · Saturated solution

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH02-MCQ-0059 | original-seed | At a particular temperature, a solution that contains the maximum amo... |
| **retire** | CH02-MCQ-0060 | concept-expansion | In the context of Saturated solution, at a particular temperature, a ... |
| **retire** | CH02-MCQ-0061 | concept-expansion | During a Grade 9 chemistry review, At a particular temperature, a sol... |
| **retire** | CH02-MCQ-0062 | concept-expansion | A chemistry teacher checks understanding of Saturated solution. At a ... |
| **retire** | CH02-MCQ-0063 | concept-expansion | Which option correctly answers this question about Saturated solution... |
| **retire** | CH02-MCQ-0064 | concept-expansion | A learner is revising Saturated solution. At a particular temperature... |
| keep | CH02-MCQ-0105 | authored-expansion-v3.1 | A student is checking the concept of saturated solution. Which statem... |
| **retire** | CH02-MCQ-0106 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH02-MCQ-0121 | authored-recall-v3.1 | For saturated solution, which statement is accurate? |

### Group 109 — Chapter 2 · Solutions

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| **retire** | CH02-MCQ-0082 | new-straight-from-scenario-concept | A student prepares three samples for a laboratory demonstration. Samp... |
| **retire** | CH02-MCQ-0083 | new-straight-from-scenario-concept | Using the information in this chemistry situation, sample X is best d... |
| **retire** | CH02-MCQ-0084 | new-straight-from-scenario-concept | For the topic "Solutions", use the following case: A student prepares... |
| **retire** | CH02-MCQ-0085 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A student prepares three sample... |
| **retire** | CH02-MCQ-0086 | new-straight-from-scenario-concept | During a chemistry investigation, A student prepares three samples fo... |
| **retire** | CH02-MCQ-0087 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student prepares ... |
| **retire** | CH02-MCQ-0088 | new-straight-from-scenario-concept | While studying Solutions, a learner considers this case: A student pr... |
| keep | CH02-MCQ-0111 | authored-expansion-v3.1 | A student is checking the concept of solutions. Which statement shoul... |
| keep | CH02-MCQ-0112 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |

### Group 110 — Chapter 3 · Isotope calculation

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH03-MCQ-0052 | original-seed | An isotope has nucleon number 23 and proton number 11. How many neutr... |
| **retire** | CH03-MCQ-0053 | concept-expansion | In the context of Isotope calculation, an isotope has nucleon number ... |
| **retire** | CH03-MCQ-0054 | concept-expansion | During a Grade 9 chemistry review, An isotope has nucleon number 23 a... |
| **retire** | CH03-MCQ-0055 | concept-expansion | A chemistry teacher checks understanding of Isotope calculation. An i... |
| **retire** | CH03-MCQ-0056 | concept-expansion | Which option correctly answers this question about Isotope calculatio... |
| **retire** | CH03-MCQ-0057 | concept-expansion | A learner is revising Isotope calculation. An isotope has nucleon num... |
| keep | CH03-MCQ-0098 | authored-expansion-v3.1 | A student is checking the concept of isotope calculation. Which state... |
| **retire** | CH03-MCQ-0099 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH03-MCQ-0116 | authored-recall-v3.1 | For isotope calculation, which statement is accurate? |

### Group 111 — Chapter 5 · Bonding application

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH05-MCQ-0049 | original-seed | A material is malleable and conducts electricity well. Which bonding ... |
| **retire** | CH05-MCQ-0050 | concept-expansion | In the context of Bonding application, a material is malleable and co... |
| **retire** | CH05-MCQ-0051 | concept-expansion | During a Grade 9 chemistry review, A material is malleable and conduc... |
| **retire** | CH05-MCQ-0052 | concept-expansion | A chemistry teacher checks understanding of Bonding application. A ma... |
| **retire** | CH05-MCQ-0053 | concept-expansion | Which option correctly answers this question about Bonding applicatio... |
| **retire** | CH05-MCQ-0054 | concept-expansion | A learner is revising Bonding application. A material is malleable an... |
| keep | CH05-MCQ-0087 | authored-expansion-v3.1 | A student is checking the concept of bonding application. Which state... |
| **retire** | CH05-MCQ-0088 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH05-MCQ-0112 | authored-recall-v3.1 | Which option correctly states the key fact about bonding application? |

### Group 112 — Chapter 5 · Conductivity comparison

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| **retire** | CH05-MCQ-0076 | new-straight-from-scenario-concept | Three materials are tested. Material A is a solid crystal that has a ... |
| **retire** | CH05-MCQ-0077 | new-straight-from-scenario-concept | Using the information in this chemistry situation, if Material A is s... |
| **retire** | CH05-MCQ-0078 | new-straight-from-scenario-concept | For the topic "Conductivity comparison", use the following case: Thre... |
| **retire** | CH05-MCQ-0079 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: Three materials are tested. Mat... |
| **retire** | CH05-MCQ-0080 | new-straight-from-scenario-concept | During a chemistry investigation, Three materials are tested. Materia... |
| **retire** | CH05-MCQ-0081 | new-straight-from-scenario-concept | Based on the laboratory situation described here, Three materials are... |
| **retire** | CH05-MCQ-0082 | new-straight-from-scenario-concept | While studying Conductivity comparison, a learner considers this case... |
| keep | CH05-MCQ-0090 | authored-expansion-v3.1 | A student is checking the concept of conductivity comparison. Which s... |
| keep | CH05-MCQ-0091 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |

### Group 113 — Chapter 8 · Bond-energy calculation

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH08-MCQ-0054 | original-seed | If the total energy required to break bonds is 500 kJ mol⁻¹ and the e... |
| **retire** | CH08-MCQ-0055 | concept-expansion | In the context of Bond-energy calculation, if the total energy requir... |
| **retire** | CH08-MCQ-0056 | concept-expansion | During a Grade 9 chemistry review, If the total energy required to br... |
| **retire** | CH08-MCQ-0057 | concept-expansion | A chemistry teacher checks understanding of Bond-energy calculation. ... |
| **retire** | CH08-MCQ-0058 | concept-expansion | Which option correctly answers this question about Bond-energy calcul... |
| **retire** | CH08-MCQ-0059 | concept-expansion | A learner is revising Bond-energy calculation. If the total energy re... |
| keep | CH08-MCQ-0070 | authored-expansion-v3.1 | A student is checking the concept of bond-energy calculation. Which s... |
| **retire** | CH08-MCQ-0071 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH08-MCQ-0087 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about bond-energy c... |

### Group 114 — Chapter 10 · Ammonium salts

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH10-MCQ-0046 | original-seed | When an ammonium salt reacts with a strong base on warming, the gas c... |
| **retire** | CH10-MCQ-0047 | concept-expansion | In the context of Ammonium salts, when an ammonium salt reacts with a... |
| **retire** | CH10-MCQ-0048 | concept-expansion | During a Grade 9 chemistry review, When an ammonium salt reacts with ... |
| **retire** | CH10-MCQ-0049 | concept-expansion | A chemistry teacher checks understanding of Ammonium salts. When an a... |
| **retire** | CH10-MCQ-0050 | concept-expansion | Which option correctly answers this question about Ammonium salts? Wh... |
| **retire** | CH10-MCQ-0051 | concept-expansion | A learner is revising Ammonium salts. When an ammonium salt reacts wi... |
| keep | CH10-MCQ-0102 | authored-expansion-v3.1 | A student is checking the concept of ammonium salts. Which statement ... |
| **retire** | CH10-MCQ-0103 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH10-MCQ-0117 | authored-recall-v3.1 | Which option correctly states the key fact about ammonium salts? |

### Group 115 — Chapter 12 · Domestic water treatment

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH12-MCQ-0015 | original-seed | Which treatment step is used to remove many solid particles from dome... |
| **retire** | CH12-MCQ-0016 | concept-expansion | In the context of Domestic water treatment, which treatment step is u... |
| **retire** | CH12-MCQ-0017 | concept-expansion | During a Grade 9 chemistry review, Which treatment step is used to re... |
| **retire** | CH12-MCQ-0018 | concept-expansion | A chemistry teacher checks understanding of Domestic water treatment.... |
| **retire** | CH12-MCQ-0019 | concept-expansion | Which option correctly answers this question about Domestic water tre... |
| **retire** | CH12-MCQ-0020 | concept-expansion | A learner is revising Domestic water treatment. Which treatment step ... |
| keep | CH12-MCQ-0063 | authored-expansion-v3.1 | A student is checking the concept of domestic water treatment. Which ... |
| **retire** | CH12-MCQ-0064 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH12-MCQ-0084 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about domestic wate... |

### Group 116 — Chapter 14 · Methane chlorination

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH14-MCQ-0039 | original-seed | The substitution of methane with chlorine under suitable light condit... |
| **retire** | CH14-MCQ-0040 | concept-expansion | In the context of Methane chlorination, the substitution of methane w... |
| **retire** | CH14-MCQ-0041 | concept-expansion | During a Grade 9 chemistry review, The substitution of methane with c... |
| **retire** | CH14-MCQ-0042 | concept-expansion | A chemistry teacher checks understanding of Methane chlorination. The... |
| **retire** | CH14-MCQ-0043 | concept-expansion | Which option correctly answers this question about Methane chlorinati... |
| **retire** | CH14-MCQ-0044 | concept-expansion | A learner is revising Methane chlorination. The substitution of metha... |
| keep | CH14-MCQ-0074 | authored-expansion-v3.1 | A student is checking the concept of methane chlorination. Which stat... |
| **retire** | CH14-MCQ-0075 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH14-MCQ-0089 | authored-recall-v3.1 | Which option correctly states the key fact about methane chlorination? |

### Group 117 — Chapter 15 · Diet scenario

9 members · 2 keep · 7 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH15-MCQ-0047 | original-seed | A student's diet provides energy but almost no protein-rich foods. Wh... |
| **retire** | CH15-MCQ-0048 | concept-expansion | In the context of Diet scenario, a student's diet provides energy but... |
| **retire** | CH15-MCQ-0049 | concept-expansion | During a Grade 9 chemistry review, A student's diet provides energy b... |
| **retire** | CH15-MCQ-0050 | concept-expansion | A chemistry teacher checks understanding of Diet scenario. A student'... |
| **retire** | CH15-MCQ-0051 | concept-expansion | Which option correctly answers this question about Diet scenario? A s... |
| **retire** | CH15-MCQ-0052 | concept-expansion | A learner is revising Diet scenario. A student's diet provides energy... |
| keep | CH15-MCQ-0071 | authored-expansion-v3.1 | A student is checking the concept of diet scenario. Which statement s... |
| **retire** | CH15-MCQ-0072 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |
| **retire** | CH15-MCQ-0091 | authored-recall-v3.1-final | For the Grade 9 topic Diet scenario, which option gives the correct c... |

### Group 118 — Chapter 3 · Subatomic particles

8 members · 2 keep · 6 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH03-MCQ-0016 | original-seed | Which particle has a relative charge of −1 and a much smaller relativ... |
| **retire** | CH03-MCQ-0017 | concept-expansion | In the context of Subatomic particles, which particle has a relative ... |
| **retire** | CH03-MCQ-0018 | concept-expansion | During a Grade 9 chemistry review, Which particle has a relative char... |
| **retire** | CH03-MCQ-0019 | concept-expansion | A chemistry teacher checks understanding of Subatomic particles. Whic... |
| **retire** | CH03-MCQ-0020 | concept-expansion | Which option correctly answers this question about Subatomic particle... |
| **retire** | CH03-MCQ-0021 | concept-expansion | A learner is revising Subatomic particles. Which particle has a relat... |
| keep | CH03-MCQ-0120 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about subatomic par... |
| **retire** | CH03-MCQ-0186 | targeted-slo-repair | Which particle contributes little to the mass of an atom compared wit... |

### Group 119 — Chapter 3 · Relative atomic mass

8 members · 2 keep · 6 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH03-MCQ-0058 | original-seed | An element has two isotopes of masses 10 and 11 with abundances 20% a... |
| **retire** | CH03-MCQ-0059 | concept-expansion | In the context of Relative atomic mass, an element has two isotopes o... |
| **retire** | CH03-MCQ-0060 | concept-expansion | During a Grade 9 chemistry review, An element has two isotopes of mas... |
| **retire** | CH03-MCQ-0061 | concept-expansion | A chemistry teacher checks understanding of Relative atomic mass. An ... |
| **retire** | CH03-MCQ-0062 | concept-expansion | Which option correctly answers this question about Relative atomic ma... |
| **retire** | CH03-MCQ-0063 | concept-expansion | A learner is revising Relative atomic mass. An element has two isotop... |
| keep | CH03-MCQ-0119 | authored-recall-v3.1 | For relative atomic mass, which statement is accurate? |
| **retire** | CH03-MCQ-0161 | coverage-repair-v3.4 | An element has two isotopes of masses 10 and 11 with abundances 20% a... |

### Group 120 — Chapter 3 · Neutrons

8 members · 2 keep · 6 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| **retire** | CH03-MCQ-0065 | new-straight-from-scenario-concept | A laboratory record gives two atoms: Atom P has proton number 17 and ... |
| **retire** | CH03-MCQ-0066 | new-straight-from-scenario-concept | Using the information in this chemistry situation, how many neutrons ... |
| **retire** | CH03-MCQ-0067 | new-straight-from-scenario-concept | For the topic "Neutrons", use the following case: A laboratory record... |
| **retire** | CH03-MCQ-0068 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A laboratory record gives two a... |
| **retire** | CH03-MCQ-0069 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A laboratory record... |
| **retire** | CH03-MCQ-0070 | new-straight-from-scenario-concept | While studying Neutrons, a learner considers this case: A laboratory ... |
| keep | CH03-MCQ-0110 | authored-expansion-v3.1 | A student is checking the concept of neutrons. Which statement should... |
| keep | CH03-MCQ-0111 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |

### Group 121 — Chapter 3 · Element identity

8 members · 2 keep · 6 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| **retire** | CH03-MCQ-0072 | new-straight-from-scenario-concept | A laboratory record gives two atoms: Atom P has proton number 17 and ... |
| **retire** | CH03-MCQ-0073 | new-straight-from-scenario-concept | Using the information in this chemistry situation, which atom represe... |
| **retire** | CH03-MCQ-0074 | new-straight-from-scenario-concept | For the topic "Element identity", use the following case: A laborator... |
| **retire** | CH03-MCQ-0075 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A laboratory record gives two a... |
| **retire** | CH03-MCQ-0076 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A laboratory record... |
| **retire** | CH03-MCQ-0077 | new-straight-from-scenario-concept | While studying Element identity, a learner considers this case: A lab... |
| keep | CH03-MCQ-0095 | authored-expansion-v3.1 | A student is checking the concept of element identity. Which statemen... |
| keep | CH03-MCQ-0096 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |

### Group 122 — Chapter 3 · Isotopic properties

8 members · 2 keep · 6 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| **retire** | CH03-MCQ-0079 | new-straight-from-scenario-concept | A laboratory record gives two atoms: Atom P has proton number 17 and ... |
| **retire** | CH03-MCQ-0080 | new-straight-from-scenario-concept | Using the information in this chemistry situation, which statement ab... |
| **retire** | CH03-MCQ-0081 | new-straight-from-scenario-concept | For the topic "Isotopic properties", use the following case: A labora... |
| **retire** | CH03-MCQ-0082 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A laboratory record gives two a... |
| **retire** | CH03-MCQ-0083 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A laboratory record... |
| **retire** | CH03-MCQ-0084 | new-straight-from-scenario-concept | While studying Isotopic properties, a learner considers this case: A ... |
| keep | CH03-MCQ-0104 | authored-expansion-v3.1 | A student is checking the concept of isotopic properties. Which state... |
| keep | CH03-MCQ-0105 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |

### Group 123 — Chapter 5 · Metallic bonding

8 members · 2 keep · 6 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH05-MCQ-0015 | original-seed | The electrical conductivity of metals is explained mainly by the pres... |
| **retire** | CH05-MCQ-0016 | concept-expansion | In the context of Metallic bonding, the electrical conductivity of me... |
| **retire** | CH05-MCQ-0017 | concept-expansion | For the topic "Metallic bonding", the electrical conductivity of meta... |
| **retire** | CH05-MCQ-0018 | concept-expansion | During a Grade 9 chemistry review, The electrical conductivity of met... |
| **retire** | CH05-MCQ-0019 | concept-expansion | A chemistry teacher checks understanding of Metallic bonding. The ele... |
| **retire** | CH05-MCQ-0020 | concept-expansion | Which option correctly answers this question about Metallic bonding? ... |
| **retire** | CH05-MCQ-0021 | concept-expansion | A learner is revising Metallic bonding. The electrical conductivity o... |
| keep | CH05-MCQ-0118 | authored-recall-v3.1 | Which option correctly states the key fact about metallic bonding? |

### Group 124 — Chapter 10 · Strong vs weak

8 members · 2 keep · 6 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH10-MCQ-0017 | original-seed | A strong acid differs from a weak acid because the strong acid: |
| **retire** | CH10-MCQ-0018 | concept-expansion | In the context of Strong vs weak, a strong acid differs from a weak a... |
| **retire** | CH10-MCQ-0019 | concept-expansion | For the topic "Strong vs weak", a strong acid differs from a weak aci... |
| **retire** | CH10-MCQ-0020 | concept-expansion | During a Grade 9 chemistry review, A strong acid differs from a weak ... |
| **retire** | CH10-MCQ-0021 | concept-expansion | A chemistry teacher checks understanding of Strong vs weak. A strong ... |
| **retire** | CH10-MCQ-0022 | concept-expansion | Which option correctly answers this question about Strong vs weak? A ... |
| **retire** | CH10-MCQ-0023 | concept-expansion | A learner is revising Strong vs weak. A strong acid differs from a we... |
| keep | CH10-MCQ-0121 | authored-recall-v3.1 | For strong vs weak, which statement is accurate? |

### Group 125 — Chapter 10 · Alkali

8 members · 2 keep · 6 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| **retire** | CH10-MCQ-0072 | new-straight-from-scenario-concept | A student compares three aqueous substances. Solution A is a strong a... |
| **retire** | CH10-MCQ-0073 | new-straight-from-scenario-concept | Using the information in this chemistry situation, solution C is an a... |
| **retire** | CH10-MCQ-0074 | new-straight-from-scenario-concept | For the topic "Alkali", use the following case: A student compares th... |
| **retire** | CH10-MCQ-0075 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A student compares three aqueou... |
| **retire** | CH10-MCQ-0076 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student compares ... |
| **retire** | CH10-MCQ-0077 | new-straight-from-scenario-concept | While studying Alkali, a learner considers this case: A student compa... |
| keep | CH10-MCQ-0099 | authored-expansion-v3.1 | A student is checking the concept of alkali. Which statement should b... |
| keep | CH10-MCQ-0100 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |

### Group 126 — Chapter 11 · Acid rain

8 members · 2 keep · 6 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH11-MCQ-0036 | original-seed | Sulfur dioxide contributes to acid rain through atmospheric reactions... |
| **retire** | CH11-MCQ-0037 | concept-expansion | In the context of Acid rain, sulfur dioxide contributes to acid rain ... |
| **retire** | CH11-MCQ-0038 | concept-expansion | During a Grade 9 chemistry review, Sulfur dioxide contributes to acid... |
| **retire** | CH11-MCQ-0039 | concept-expansion | A chemistry teacher checks understanding of Acid rain. Sulfur dioxide... |
| **retire** | CH11-MCQ-0040 | concept-expansion | Which option correctly answers this question about Acid rain? Sulfur ... |
| **retire** | CH11-MCQ-0041 | concept-expansion | A learner is revising Acid rain. Sulfur dioxide contributes to acid r... |
| keep | CH11-MCQ-0076 | authored-recall-v3.1 | Which statement should a Grade 9 student remember about acid rain? |
| **retire** | CH11-MCQ-0084 | authored-recall-v3.1-final | For the Grade 9 topic Acid rain, which option gives the correct chemi... |

### Group 127 — Chapter 13 · Functional group

8 members · 2 keep · 6 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| **retire** | CH13-MCQ-0032 | new-straight-from-scenario-concept | A student compares four organic substances. Substance P is CH₃CH₂OH, ... |
| **retire** | CH13-MCQ-0033 | new-straight-from-scenario-concept | Using the information in this chemistry situation, which substance co... |
| **retire** | CH13-MCQ-0034 | new-straight-from-scenario-concept | For the topic "Functional group", use the following case: A student c... |
| **retire** | CH13-MCQ-0035 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A student compares four organic... |
| **retire** | CH13-MCQ-0036 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student compares ... |
| **retire** | CH13-MCQ-0037 | new-straight-from-scenario-concept | While studying Functional group, a learner considers this case: A stu... |
| keep | CH13-MCQ-0115 | authored-expansion-v3.1 | Which statement about structure classification is NOT correct? |
| keep | CH13-MCQ-0118 | authored-expansion-v3.1 | Which statement about unsaturation is NOT correct? |

### Group 128 — Chapter 13 · Structure classification

8 members · 2 keep · 6 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| **retire** | CH13-MCQ-0085 | new-straight-from-scenario-concept | A student compares four organic substances. Substance P is CH₃CH₂OH, ... |
| **retire** | CH13-MCQ-0086 | new-straight-from-scenario-concept | Using the information in this chemistry situation, which substance is... |
| **retire** | CH13-MCQ-0087 | new-straight-from-scenario-concept | For the topic "Structure classification", use the following case: A s... |
| **retire** | CH13-MCQ-0088 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A student compares four organic... |
| **retire** | CH13-MCQ-0089 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student compares ... |
| **retire** | CH13-MCQ-0090 | new-straight-from-scenario-concept | While studying Structure classification, a learner considers this cas... |
| keep | CH13-MCQ-0116 | authored-expansion-v3.1 | A student is checking the concept of structure classification. Which ... |
| keep | CH13-MCQ-0117 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |

### Group 129 — Chapter 2 · Solubility

7 members · 2 keep · 5 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH02-MCQ-0052 | new-straight-from-scenario-concept | A student prepares three samples for a laboratory demonstration. Samp... |
| keep | CH02-MCQ-0053 | new-straight-from-scenario-concept | Using the information in this chemistry situation, if more of the sol... |
| **retire** | CH02-MCQ-0054 | new-straight-from-scenario-concept | For the topic "Solubility", use the following case: A student prepare... |
| **retire** | CH02-MCQ-0055 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A student prepares three sample... |
| **retire** | CH02-MCQ-0056 | new-straight-from-scenario-concept | During a chemistry investigation, A student prepares three samples fo... |
| **retire** | CH02-MCQ-0057 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student prepares ... |
| **retire** | CH02-MCQ-0058 | new-straight-from-scenario-concept | While studying Solubility, a learner considers this case: A student p... |

### Group 130 — Chapter 2 · Mixtures

7 members · 2 keep · 5 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH02-MCQ-0066 | new-straight-from-scenario-concept | A student prepares three samples for a laboratory demonstration. Samp... |
| keep | CH02-MCQ-0067 | new-straight-from-scenario-concept | Using the information in this chemistry situation, which sample is be... |
| **retire** | CH02-MCQ-0068 | new-straight-from-scenario-concept | For the topic "Mixtures", use the following case: A student prepares ... |
| **retire** | CH02-MCQ-0069 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A student prepares three sample... |
| **retire** | CH02-MCQ-0070 | new-straight-from-scenario-concept | During a chemistry investigation, A student prepares three samples fo... |
| **retire** | CH02-MCQ-0071 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student prepares ... |
| **retire** | CH02-MCQ-0072 | new-straight-from-scenario-concept | While studying Mixtures, a learner considers this case: A student pre... |

### Group 131 — Chapter 2 · Mixtures

7 members · 2 keep · 5 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH02-MCQ-0074 | new-straight-from-scenario-concept | A student prepares three samples for a laboratory demonstration. Samp... |
| keep | CH02-MCQ-0075 | new-straight-from-scenario-concept | Using the information in this chemistry situation, which sample can m... |
| **retire** | CH02-MCQ-0076 | new-straight-from-scenario-concept | For the topic "Mixtures", use the following case: A student prepares ... |
| **retire** | CH02-MCQ-0077 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A student prepares three sample... |
| **retire** | CH02-MCQ-0078 | new-straight-from-scenario-concept | During a chemistry investigation, A student prepares three samples fo... |
| **retire** | CH02-MCQ-0079 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student prepares ... |
| **retire** | CH02-MCQ-0080 | new-straight-from-scenario-concept | While studying Mixtures, a learner considers this case: A student pre... |

### Group 132 — Chapter 3 · Isotopes

7 members · 2 keep · 5 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH03-MCQ-0045 | new-straight-from-scenario-concept | A laboratory record gives two atoms: Atom P has proton number 17 and ... |
| keep | CH03-MCQ-0046 | new-straight-from-scenario-concept | Using the information in this chemistry situation, atoms P and Q are: |
| **retire** | CH03-MCQ-0047 | new-straight-from-scenario-concept | For the topic "Isotopes", use the following case: A laboratory record... |
| **retire** | CH03-MCQ-0048 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A laboratory record gives two a... |
| **retire** | CH03-MCQ-0049 | new-straight-from-scenario-concept | During a chemistry investigation, A laboratory record gives two atoms... |
| **retire** | CH03-MCQ-0050 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A laboratory record... |
| **retire** | CH03-MCQ-0051 | new-straight-from-scenario-concept | While studying Isotopes, a learner considers this case: A laboratory ... |

### Group 133 — Chapter 5 · Ionic properties

7 members · 2 keep · 5 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| **retire** | CH05-MCQ-0056 | new-straight-from-scenario-concept | Three materials are tested. Material A is a solid crystal that has a ... |
| **retire** | CH05-MCQ-0057 | new-straight-from-scenario-concept | Using the information in this chemistry situation, material A most li... |
| **retire** | CH05-MCQ-0058 | new-straight-from-scenario-concept | For the topic "Ionic properties", use the following case: Three mater... |
| **retire** | CH05-MCQ-0059 | new-straight-from-scenario-concept | Based on the laboratory situation described here, Three materials are... |
| **retire** | CH05-MCQ-0060 | new-straight-from-scenario-concept | While studying Ionic properties, a learner considers this case: Three... |
| keep | CH05-MCQ-0102 | authored-expansion-v3.1 | A student is checking the concept of ionic properties. Which statemen... |
| keep | CH05-MCQ-0103 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |

### Group 134 — Chapter 10 · Acids and bases

7 members · 2 keep · 5 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| **retire** | CH10-MCQ-0060 | new-straight-from-scenario-concept | A student compares three aqueous substances. Solution A is a strong a... |
| **retire** | CH10-MCQ-0061 | new-straight-from-scenario-concept | Using the information in this chemistry situation, according to the B... |
| **retire** | CH10-MCQ-0062 | new-straight-from-scenario-concept | For the topic "Acids and bases", use the following case: A student co... |
| **retire** | CH10-MCQ-0063 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student compares ... |
| **retire** | CH10-MCQ-0064 | new-straight-from-scenario-concept | While studying Acids and bases, a learner considers this case: A stud... |
| keep | CH10-MCQ-0096 | authored-expansion-v3.1 | A student is checking the concept of acids and bases. Which statement... |
| keep | CH10-MCQ-0097 | authored-expansion-v3.1 | Which conclusion follows directly from the Grade 9 chemistry concept ... |

### Group 135 — Chapter 10 · Reaction interpretation

7 members · 2 keep · 5 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH10-MCQ-0079 | new-straight-from-scenario-concept | A student compares three aqueous substances. Solution A is a strong a... |
| keep | CH10-MCQ-0080 | new-straight-from-scenario-concept | Using the information in this chemistry situation, if the acid is rea... |
| **retire** | CH10-MCQ-0081 | new-straight-from-scenario-concept | For the topic "Reaction interpretation", use the following case: A st... |
| **retire** | CH10-MCQ-0082 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A student compares three aqueou... |
| **retire** | CH10-MCQ-0083 | new-straight-from-scenario-concept | During a chemistry investigation, A student compares three aqueous su... |
| **retire** | CH10-MCQ-0084 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student compares ... |
| **retire** | CH10-MCQ-0085 | new-straight-from-scenario-concept | While studying Reaction interpretation, a learner considers this case... |

### Group 136 — Chapter 13 · Structural formula

7 members · 2 keep · 5 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH13-MCQ-0017 | new-straight-from-scenario-concept | A student compares four organic substances. Substance P is CH₃CH₂OH, ... |
| keep | CH13-MCQ-0018 | new-straight-from-scenario-concept | Using the information in this chemistry situation, which substance is... |
| **retire** | CH13-MCQ-0019 | new-straight-from-scenario-concept | For the topic "Structural formula", use the following case: A student... |
| **retire** | CH13-MCQ-0020 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A student compares four organic... |
| **retire** | CH13-MCQ-0021 | new-straight-from-scenario-concept | During a chemistry investigation, A student compares four organic sub... |
| **retire** | CH13-MCQ-0022 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student compares ... |
| **retire** | CH13-MCQ-0023 | new-straight-from-scenario-concept | While studying Structural formula, a learner considers this case: A s... |

### Group 137 — Chapter 13 · Unsaturation

7 members · 2 keep · 5 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH13-MCQ-0077 | new-straight-from-scenario-concept | A student compares four organic substances. Substance P is CH₃CH₂OH, ... |
| keep | CH13-MCQ-0078 | new-straight-from-scenario-concept | Using the information in this chemistry situation, which substance is... |
| **retire** | CH13-MCQ-0079 | new-straight-from-scenario-concept | For the topic "Unsaturation", use the following case: A student compa... |
| **retire** | CH13-MCQ-0080 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: A student compares four organic... |
| **retire** | CH13-MCQ-0081 | new-straight-from-scenario-concept | During a chemistry investigation, A student compares four organic sub... |
| **retire** | CH13-MCQ-0082 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student compares ... |
| **retire** | CH13-MCQ-0083 | new-straight-from-scenario-concept | While studying Unsaturation, a learner considers this case: A student... |

### Group 138 — Chapter 5 · Metallic bonding

6 members · 2 keep · 4 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH05-MCQ-0062 | new-straight-from-scenario-concept | Three materials are tested. Material A is a solid crystal that has a ... |
| keep | CH05-MCQ-0063 | new-straight-from-scenario-concept | Using the information in this chemistry situation, which property of ... |
| **retire** | CH05-MCQ-0064 | new-straight-from-scenario-concept | For the topic "Metallic bonding", use the following case: Three mater... |
| **retire** | CH05-MCQ-0065 | new-straight-from-scenario-concept | During a chemistry investigation, Three materials are tested. Materia... |
| **retire** | CH05-MCQ-0066 | new-straight-from-scenario-concept | Based on the laboratory situation described here, Three materials are... |
| **retire** | CH05-MCQ-0067 | new-straight-from-scenario-concept | While studying Metallic bonding, a learner considers this case: Three... |

### Group 139 — Chapter 5 · Molecular substance

6 members · 2 keep · 4 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH05-MCQ-0069 | new-straight-from-scenario-concept | Three materials are tested. Material A is a solid crystal that has a ... |
| keep | CH05-MCQ-0070 | new-straight-from-scenario-concept | Using the information in this chemistry situation, material C is like... |
| **retire** | CH05-MCQ-0071 | new-straight-from-scenario-concept | For the topic "Molecular substance", use the following case: Three ma... |
| **retire** | CH05-MCQ-0072 | new-straight-from-scenario-concept | A Grade 9 learner is given this case: Three materials are tested. Mat... |
| **retire** | CH05-MCQ-0073 | new-straight-from-scenario-concept | During a chemistry investigation, Three materials are tested. Materia... |
| **retire** | CH05-MCQ-0074 | new-straight-from-scenario-concept | While studying Molecular substance, a learner considers this case: Th... |

### Group 140 — Chapter 10 · Strong acid

5 members · 2 keep · 3 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH10-MCQ-0066 | new-straight-from-scenario-concept | A student compares three aqueous substances. Solution A is a strong a... |
| keep | CH10-MCQ-0067 | new-straight-from-scenario-concept | Using the information in this chemistry situation, compared with weak... |
| **retire** | CH10-MCQ-0068 | new-straight-from-scenario-concept | For the topic "Strong acid", use the following case: A student compar... |
| **retire** | CH10-MCQ-0069 | new-straight-from-scenario-concept | Based on the laboratory situation described here, A student compares ... |
| **retire** | CH10-MCQ-0070 | new-straight-from-scenario-concept | While studying Strong acid, a learner considers this case: A student ... |

### Group 141 — Chapter 3 · Atomic Structure

2 members · 2 keep · 0 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH03-MCQ-0144 | coverage-repair-v3.4 | A particle has relative charge 0 and a relative mass approximately eq... |
| keep | CH03-MCQ-0184 | targeted-slo-repair | An unknown subatomic particle has relative charge 0 and relative mass... |

### Group 142 — Chapter 4 · Halogens

2 members · 2 keep · 0 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH04-MCQ-0066 | authored-expansion-v3.1 | Which statement about halogens is NOT correct? |
| keep | CH04-MCQ-0069 | authored-expansion-v3.1 | Which statement about noble gases is NOT correct? |

### Group 143 — Chapter 4 · Periodic Table and Periodicity

2 members · 2 keep · 0 retire · 0 scenario kept

| Decision | ID | Variant | Stem |
|---|---|---|---|
| keep | CH04-MCQ-0113 | coverage-repair-v3.4 | Which term is used for Group VII elements in the framework? |
| keep | CH04-MCQ-0144 | targeted-slo-repair | Which term refers to Group 17 elements? |


// Simple test for the assessment functionality
const testPersonalityAnswers = `
1. yes
2. no
3. yes
4. yes
5. no
6. yes
7. yes
8. no
9. yes
10. no
11. yes
12. no
13. yes
14. no
15. yes
16. yes
17. no
18. yes
19. yes
20. no
21. yes
22. no
23. yes
24. no
25. yes
26. yes
27. no
28. yes
29. no
30. yes
31. no
32. yes
33. no
34. yes
35. yes
36. yes
37. no
38. yes
39. no
40. no
41. no
42. yes
43. no
44. yes
45. yes
46. yes
47. no
48. yes
`;

const testSelfEfficacyAnswers = `
1. 3
2. 4
3. 3
4. 2
5. 3
6. 4
7. 3
8. 3
9. 2
10. 3
`;

console.log('Test data prepared for assessment functionality');
console.log('Personality test answers:', testPersonalityAnswers.split('\n').filter(line => line.trim()).length, 'answers');
console.log('Self-efficacy test answers:', testSelfEfficacyAnswers.split('\n').filter(line => line.trim()).length, 'answers');

// Test API call example
const testApiCall = {
  messages: [
    { content: "I want to take a personality test", sender: "user" },
    { content: testPersonalityAnswers, sender: "user" }
  ],
  sessionType: "text",
  userId: "test-user",
  companyId: "test-company"
};

console.log('API test payload ready');
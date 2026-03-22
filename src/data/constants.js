
// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#F8FAFC", white:"#FFFFFF",
  indigo:"#4F46E5", indigoLight:"#EEF2FF", indigoMid:"#818CF8",
  text:"#1E293B", textMid:"#475569", muted:"#94A3B8", border:"#E2E8F0",
  pastelPurple:"#EEF2FF", pastelBlue:"#E0F2FE",
  pastelGreen:"#ECFDF5", pastelYellow:"#FFF7ED",
  green:"#10B981", amber:"#F59E0B", red:"#EF4444", orange:"#6366F1",
  dark:"#0F172A",
};

// ── 12 Challenges ─────────────────────────────────────────────────────────────
const CHALLENGES=[
  {id:1,title:"Two Sum",difficulty:"Easy",category:"Arrays",xp:100,pastel:C.pastelYellow,accent:C.amber,icon:"∑",timeLimit:30,
   description:`Given an array of integers and a target, return indices of two numbers that add up to target.\n\nExample:\nInput: nums=[2,7,11,15], target=9\nOutput: [0,1]\n\nConstraints:\n• 2 ≤ nums.length ≤ 10⁴\n• Exactly one solution always exists`,
   starterCode:{javascript:"function twoSum(nums, target) {\n  // your solution\n}",python:"def two_sum(nums, target):\n    pass",java:"class Solution {\n  public int[] twoSum(int[] nums, int target) {\n    return new int[]{};\n  }\n}",cpp:'#include <iostream>\n#include <vector>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    return {};\n}',c:'#include <stdio.h>\n#include <stdlib.h>\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* result = malloc(2 * sizeof(int));\n    return result;\n}',go:'package main\n\nfunc twoSum(nums []int, target int) []int {\n    // your solution\n    return nil\n}',rust:'fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n    vec![]\n}'},
   testCases:[{input:"[2,7,11,15], 9",expected:"[0,1]"},{input:"[3,2,4], 6",expected:"[1,2]"},{input:"[3,3], 6",expected:"[0,1]"}],
   hints:["Try using a hash map for O(n) time","For each element x, check if target-x exists"],
   tags:["Hash Map","Array"]},
  {id:2,title:"Reverse Linked List",difficulty:"Medium",category:"Linked Lists",xp:200,pastel:C.pastelPurple,accent:C.indigo,icon:"⇄",timeLimit:45,
   description:`Given the head of a singly linked list, reverse it.\n\nExample:\nInput: [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n\nConstraints: 0 ≤ nodes ≤ 5000`,
   starterCode:{javascript:"function reverseList(head) {\n  // your solution\n}",python:"def reverse_list(head):\n    pass",java:"class Solution {\n  public ListNode reverseList(ListNode head) {\n    return null;\n  }\n}",cpp:'#include <iostream>\nusing namespace std;\nstruct ListNode { int val; ListNode* next; };\nListNode* reverseList(ListNode* head) {\n    return nullptr;\n}',c:'#include <stdio.h>\nstruct ListNode { int val; struct ListNode* next; };\nstruct ListNode* reverseList(struct ListNode* head) {\n    return NULL;\n}',go:'package main\n\ntype ListNode struct {\n    Val  int\n    Next *ListNode\n}\n\nfunc reverseList(head *ListNode) *ListNode {\n    return nil\n}',rust:'#[derive(PartialEq, Eq, Clone, Debug)]\npub struct ListNode { pub val: i32, pub next: Option<Box<ListNode>> }\n\npub fn reverse_list(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {\n    None\n}'},
   testCases:[{input:"[1,2,3,4,5]",expected:"[5,4,3,2,1]"},{input:"[1,2]",expected:"[2,1]"},{input:"[]",expected:"[]"}],
   hints:["Use three pointers: prev, curr, next","Iterative approach is cleaner than recursive"],
   tags:["Linked List","Two Pointers"]},
  {id:3,title:"Binary Search",difficulty:"Easy",category:"Search",xp:100,pastel:C.pastelBlue,accent:"#3B82F6",icon:"⌖",timeLimit:25,
   description:`Given a sorted array and target, return the index or -1.\n\nExample:\nInput: [-1,0,3,5,9,12], target=9\nOutput: 4\n\nRequirement: O(log n) — no linear scan!`,
   starterCode:{javascript:"function search(nums, target) {\n  // your solution\n}",python:"def search(nums, target):\n    pass",java:"class Solution {\n  public int search(int[] nums, int target) {\n    return -1;\n  }\n}",cpp:'#include <iostream>\n#include <vector>\nusing namespace std;\nint search(vector<int>& nums, int target) {\n    return -1;\n}',c:'#include <stdio.h>\nint search(int* nums, int numsSize, int target) {\n    return -1;\n}',go:'package main\n\nfunc search(nums []int, target int) int {\n    return -1\n}',rust:'pub fn search(nums: Vec<i32>, target: i32) -> i32 {\n    -1\n}'},
   testCases:[{input:"[-1,0,3,5,9,12], 9",expected:"4"},{input:"[-1,0,3,5,9,12], 2",expected:"-1"},{input:"[5], 5",expected:"0"}],
   hints:["Maintain low and high pointers","Check mid = (low+high)//2 each iteration"],
   tags:["Binary Search","Array"]},
  {id:4,title:"Valid Parentheses",difficulty:"Easy",category:"Stack",xp:120,pastel:C.pastelGreen,accent:C.green,icon:"()",timeLimit:25,
   description:`Given a string with ()[]{}  determine if it is valid.\n\nExample:\nInput: "()[]{}"  Output: true\nInput: "(]"  Output: false`,
   starterCode:{javascript:"function isValid(s) {\n  // your solution\n}",python:"def is_valid(s):\n    pass",java:"class Solution {\n  public boolean isValid(String s) {\n    return false;\n  }\n}",cpp:'#include <iostream>\n#include <string>\nusing namespace std;\nbool isValid(string s) {\n    return false;\n}',c:'#include <stdio.h>\n#include <stdbool.h>\nbool isValid(char* s) {\n    return false;\n}',go:'package main\n\nfunc isValid(s string) bool {\n    return false\n}',rust:'pub fn is_valid(s: String) -> bool {\n    false\n}'},
   testCases:[{input:'"()[]{}"',expected:"true"},{input:'"(]"',expected:"false"},{input:'"([)]"',expected:"false"}],
   hints:["Use a stack","Push opening brackets; pop and compare for closing ones"],
   tags:["Stack","String"]},
  {id:5,title:"Maximum Subarray",difficulty:"Medium",category:"Dynamic Programming",xp:220,pastel:C.pastelYellow,accent:C.orange,icon:"⟨⟩",timeLimit:40,
   description:`Find the contiguous subarray with the largest sum.\n\nExample:\nInput: [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6  (subarray [4,-1,2,1])\n\nConstraints: 1 ≤ nums.length ≤ 10⁵`,
   starterCode:{javascript:"function maxSubArray(nums) {\n  // Kadane's algorithm\n}",python:"def max_sub_array(nums):\n    pass",java:"class Solution {\n  public int maxSubArray(int[] nums) {\n    return 0;\n  }\n}",cpp:'#include <iostream>\n#include <vector>\nusing namespace std;\nint maxSubArray(vector<int>& nums) {\n    return 0;\n}',c:'#include <stdio.h>\nint maxSubArray(int* nums, int numsSize) {\n    return 0;\n}',go:'package main\n\nfunc maxSubArray(nums []int) int {\n    return 0\n}',rust:'pub fn max_sub_array(nums: Vec<i32>) -> i32 {\n    0\n}'},
   testCases:[{input:"[-2,1,-3,4,-1,2,1,-5,4]",expected:"6"},{input:"[1]",expected:"1"},{input:"[5,4,-1,7,8]",expected:"23"}],
   hints:["Kadane's: track currentSum and globalMax","Reset currentSum to 0 if it goes negative"],
   tags:["DP","Array","Greedy"]},
  {id:6,title:"Climbing Stairs",difficulty:"Easy",category:"Dynamic Programming",xp:130,pastel:C.pastelPurple,accent:C.indigo,icon:"🪜",timeLimit:20,
   description:`You can climb 1 or 2 steps. How many ways to reach n steps?\n\nExample:\nInput: n=3  Output: 3\n(1+1+1, 1+2, 2+1)\n\nConstraints: 1 ≤ n ≤ 45`,
   starterCode:{javascript:"function climbStairs(n) {\n  // fibonacci variant\n}",python:"def climb_stairs(n):\n    pass",java:"class Solution {\n  public int climbStairs(int n) {\n    return 0;\n  }\n}",cpp:'#include <iostream>\nusing namespace std;\nint climbStairs(int n) {\n    return 0;\n}',c:'#include <stdio.h>\nint climbStairs(int n) {\n    return 0;\n}',go:'package main\n\nfunc climbStairs(n int) int {\n    return 0\n}',rust:'pub fn climb_stairs(n: i32) -> i32 {\n    0\n}'},
   testCases:[{input:"2",expected:"2"},{input:"3",expected:"3"},{input:"5",expected:"8"}],
   hints:["This is exactly Fibonacci!","f(n) = f(n-1) + f(n-2), base cases f(1)=1, f(2)=2"],
   tags:["DP","Math","Memoization"]},
  {id:7,title:"Merge Two Sorted Lists",difficulty:"Easy",category:"Linked Lists",xp:150,pastel:C.pastelBlue,accent:"#3B82F6",icon:"⊕",timeLimit:30,
   description:`Merge two sorted linked lists and return the head.\n\nExample:\nInput: l1=[1,2,4], l2=[1,3,4]\nOutput: [1,1,2,3,4,4]`,
   starterCode:{javascript:"function mergeTwoLists(l1, l2) {\n  // your solution\n}",python:"def merge_two_lists(l1, l2):\n    pass",java:"class Solution {\n  public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n    return null;\n  }\n}",cpp:'#include <iostream>\nusing namespace std;\nstruct ListNode { int val; ListNode* next; };\nListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {\n    return nullptr;\n}',c:'#include <stdio.h>\nstruct ListNode { int val; struct ListNode* next; };\nstruct ListNode* mergeTwoLists(struct ListNode* l1, struct ListNode* l2) {\n    return NULL;\n}',go:'package main\n\ntype ListNode struct {\n    Val  int\n    Next *ListNode\n}\n\nfunc mergeTwoLists(l1 *ListNode, l2 *ListNode) *ListNode {\n    return nil\n}',rust:'#[derive(PartialEq, Eq, Clone, Debug)]\npub struct ListNode { pub val: i32, pub next: Option<Box<ListNode>> }\n\npub fn merge_two_lists(l1: Option<Box<ListNode>>, l2: Option<Box<ListNode>>) -> Option<Box<ListNode>> {\n    None\n}'},
   testCases:[{input:"[1,2,4], [1,3,4]",expected:"[1,1,2,3,4,4]"},{input:"[], []",expected:"[]"},{input:"[], [0]",expected:"[0]"}],
   hints:["Use a dummy head node","Compare values and advance the smaller pointer"],
   tags:["Linked List","Recursion"]},
  {id:8,title:"Best Time to Buy Stock",difficulty:"Easy",category:"Arrays",xp:140,pastel:C.pastelGreen,accent:C.green,icon:"📈",timeLimit:25,
   description:`Given prices[], find max profit from one buy+sell.\n\nExample:\nInput: [7,1,5,3,6,4]\nOutput: 5 (buy at 1, sell at 6)\n\nConstraints: 1 ≤ prices.length ≤ 10⁵`,
   starterCode:{javascript:"function maxProfit(prices) {\n  // your solution\n}",python:"def max_profit(prices):\n    pass",java:"class Solution {\n  public int maxProfit(int[] prices) {\n    return 0;\n  }\n}",cpp:'#include <iostream>\n#include <vector>\nusing namespace std;\nint maxProfit(vector<int>& prices) {\n    return 0;\n}',c:'#include <stdio.h>\nint maxProfit(int* prices, int pricesSize) {\n    return 0;\n}',go:'package main\n\nfunc maxProfit(prices []int) int {\n    return 0\n}',rust:'pub fn max_profit(prices: Vec<i32>) -> i32 {\n    0\n}'},
   testCases:[{input:"[7,1,5,3,6,4]",expected:"5"},{input:"[7,6,4,3,1]",expected:"0"},{input:"[1,2]",expected:"1"}],
   hints:["Track minimum price seen so far","profit = current price − minPrice"],
   tags:["Array","Greedy"]},
  {id:9,title:"Longest Common Prefix",difficulty:"Easy",category:"Strings",xp:110,pastel:C.pastelYellow,accent:C.amber,icon:"Σ",timeLimit:20,
   description:`Find the longest common prefix in an array of strings.\n\nExample:\nInput: ["flower","flow","flight"]\nOutput: "fl"\n\nReturn "" if no common prefix.`,
   starterCode:{javascript:'function longestCommonPrefix(strs) {\n  // your solution\n}',python:"def longest_common_prefix(strs):\n    pass",java:'class Solution {\n  public String longestCommonPrefix(String[] strs) {\n    return "";\n  }\n}',cpp:'#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\nstring longestCommonPrefix(vector<string>& strs) {\n    // your solution\n    return "";\n}',c:'#include <stdio.h>\n#include <string.h>\nchar* longestCommonPrefix(char** strs, int strsSize) {\n    return "";\n}',go:'package main\n\nfunc longestCommonPrefix(strs []string) string {\n    return ""\n}',rust:'pub fn longest_common_prefix(strs: Vec<String>) -> String {\n    String::new()\n}'},
   testCases:[{input:'["flower","flow","flight"]',expected:'"fl"'},{input:'["dog","racecar","car"]',expected:'""'},{input:'["ab","a"]',expected:'"a"'}],
   hints:["Sort and compare first vs last string","Or scan character-by-character"],
   tags:["String"]},
  {id:10,title:"Number of Islands",difficulty:"Hard",category:"Graphs",xp:350,pastel:C.pastelPurple,accent:C.indigo,icon:"🏝",timeLimit:60,
   description:`Count islands in an m×n grid of '1' (land) and '0' (water).\n\nExample:\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1\nOutput: 3\n\nUse DFS or BFS.`,
   starterCode:{javascript:"function numIslands(grid) {\n  // DFS/BFS\n}",python:"def num_islands(grid):\n    pass",java:"class Solution {\n  public int numIslands(char[][] grid) {\n    return 0;\n  }\n}",cpp:'#include <iostream>\n#include <vector>\nusing namespace std;\nint numIslands(vector<vector<char>>& grid) {\n    return 0;\n}',c:'#include <stdio.h>\nint numIslands(char** grid, int gridSize, int* gridColSize) {\n    return 0;\n}',go:'package main\n\nfunc numIslands(grid [][]byte) int {\n    return 0\n}',rust:'pub fn num_islands(grid: Vec<Vec<char>>) -> i32 {\n    0\n}'},
   testCases:[{input:'[["1","1","0"],["0","1","0"],["0","0","1"]]',expected:"2"},{input:'[["1","1","1"],["0","1","0"],["1","1","1"]]',expected:"1"}],
   hints:["DFS from each unvisited '1' cell","Mark visited cells as '0' to avoid revisiting"],
   tags:["Graph","DFS","BFS","Matrix"]},
  {id:11,title:"3Sum",difficulty:"Hard",category:"Arrays",xp:320,pastel:C.pastelBlue,accent:"#3B82F6",icon:"Σ³",timeLimit:55,
   description:`Find all unique triplets [a,b,c] where a+b+c=0.\n\nExample:\nInput: [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]\n\nNo duplicate triplets.`,
   starterCode:{javascript:"function threeSum(nums) {\n  // sort + two pointers\n}",python:"def three_sum(nums):\n    pass",java:"class Solution {\n  public List<List<Integer>> threeSum(int[] nums) {\n    return new ArrayList<>();\n  }\n}",cpp:'#include <iostream>\n#include <vector>\nusing namespace std;\nvector<vector<int>> threeSum(vector<int>& nums) {\n    return {};\n}',c:'#include <stdio.h>\nint** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}',go:'package main\n\nfunc threeSum(nums []int) [][]int {\n    return nil\n}',rust:'pub fn three_sum(nums: Vec<i32>) -> Vec<Vec<i32>> {\n    vec![]\n}'},
   testCases:[{input:"[-1,0,1,2,-1,-4]",expected:"[[-1,-1,2],[-1,0,1]]"},{input:"[0,1,1]",expected:"[]"},{input:"[0,0,0]",expected:"[[0,0,0]]"}],
   hints:["Sort first to enable two-pointer","Fix one element; use two pointers for the rest"],
   tags:["Array","Two Pointers","Sorting"]},
  {id:12,title:"LRU Cache",difficulty:"Hard",category:"Design",xp:400,pastel:C.pastelGreen,accent:C.green,icon:"🗄",timeLimit:70,
   description:`Design an O(1) Least Recently Used cache.\n\nLRUCache(capacity) — init\nget(key) — return value or -1\nput(key,value) — insert/update, evict LRU if full`,
   starterCode:{javascript:"class LRUCache {\n  constructor(capacity) {}\n  get(key) { return -1; }\n  put(key, value) {}\n}",python:"class LRUCache:\n  def __init__(self, capacity): pass\n  def get(self, key): return -1\n  def put(self, key, value): pass",java:"class LRUCache {\n  LRUCache(int capacity) {}\n  int get(int key) { return -1; }\n  void put(int key, int value) {}\n}",cpp:'#include <iostream>\n#include <unordered_map>\nusing namespace std;\nclass LRUCache {\npublic:\n    LRUCache(int capacity) {}\n    int get(int key) { return -1; }\n    void put(int key, int value) {}\n};',c:'#include <stdio.h>\n// LRU Cache in C\ntypedef struct { int capacity; } LRUCache;\nLRUCache* lRUCacheCreate(int capacity) { return NULL; }\nint lRUCacheGet(LRUCache* obj, int key) { return -1; }\nvoid lRUCachePut(LRUCache* obj, int key, int value) {}',go:'package main\n\ntype LRUCache struct{}\n\nfunc Constructor(capacity int) LRUCache {\n    return LRUCache{}\n}\n\nfunc (l *LRUCache) Get(key int) int {\n    return -1\n}\n\nfunc (l *LRUCache) Put(key int, value int) {}',rust:'use std::collections::HashMap;\nstruct LRUCache {}\nimpl LRUCache {\n    fn new(capacity: i32) -> Self { LRUCache {} }\n    fn get(&self, key: i32) -> i32 { -1 }\n    fn put(&mut self, key: i32, value: i32) {}\n}'},
   testCases:[{input:"capacity=2; put(1,1),put(2,2),get(1),put(3,3),get(2)",expected:"1, -1"},{input:"capacity=1; put(2,1),get(2),put(3,2),get(3)",expected:"1, 2"}],
   hints:["Combine HashMap + Doubly Linked List","HashMap for O(1) lookup; DLL for O(1) insertion/deletion"],
   tags:["Design","Hash Map","Linked List"]},
];

// ── Leaderboard ───────────────────────────────────────────────────────────────
const LEADERBOARD=[
  {rank:1, name:"Priya Sharma",     avatar:"PS",pts:9840,solved:12,streak:18,badge:"🏆",country:"🇮🇳"},
  {rank:2, name:"Carlos Ruiz",      avatar:"CR",pts:9210,solved:11,streak:14,badge:"🥈",country:"🇲🇽"},
  {rank:3, name:"Mei Chen",         avatar:"MC",pts:8765,solved:11,streak:22,badge:"🥉",country:"🇨🇳"},
  {rank:4, name:"Alex Rudewel",     avatar:"AR",pts:4525,solved:7, streak:5, badge:"⭐",country:"🇺🇸"},
  {rank:5, name:"Ibrahim Al-Sayed", avatar:"IA",pts:4200,solved:6, streak:9, badge:"⭐",country:"🇦🇪"},
  {rank:6, name:"Sofia Petrov",     avatar:"SP",pts:3980,solved:6, streak:7, badge:"⭐",country:"🇷🇺"},
  {rank:7, name:"James Okafor",     avatar:"JO",pts:3550,solved:5, streak:4, badge:"⭐",country:"🇳🇬"},
  {rank:8, name:"Aisha Patel",      avatar:"AP",pts:3100,solved:5, streak:3, badge:"⭐",country:"🇮🇳"},
  {rank:9, name:"Lucas Müller",     avatar:"LM",pts:2700,solved:4, streak:2, badge:"⭐",country:"🇩🇪"},
  {rank:10,name:"Emma Williams",    avatar:"EW",pts:2200,solved:4, streak:6, badge:"⭐",country:"🇬🇧"},
  {rank:11,name:"Raj Patel",        avatar:"RP",pts:1900,solved:3, streak:1, badge:"⭐",country:"🇮🇳"},
  {rank:12,name:"Yuki Tanaka",      avatar:"YT",pts:1600,solved:3, streak:4, badge:"⭐",country:"🇯🇵"},
  {rank:13,name:"Demo User",        avatar:"DU",pts:1200,solved:2, streak:2, badge:"⭐",country:"🌍"},
  {rank:14,name:"Fatima Al-Hassan", avatar:"FH",pts:980, solved:2, streak:3, badge:"⭐",country:"🇸🇦"},
  {rank:15,name:"Test Account",     avatar:"TA",pts:300, solved:1, streak:1, badge:"⭐",country:"🌍"},
];

// ── Job Board ─────────────────────────────────────────────────────────────────
const JOB_BOARD=[
  {id:1, title:"Backend Engineer",       company:"Stripe",     logo:"💳",location:"Remote",        salary:"$130k–$160k",type:"Full-time",  skills:["Node.js","PostgreSQL","AWS"],           posted:"2 days ago",  match:91,hot:true},
  {id:2, title:"Full-Stack Developer",   company:"Razorpay",   logo:"🪙",location:"Bengaluru",     salary:"₹28–40 LPA", type:"Full-time",  skills:["React","Go","Kubernetes"],             posted:"3 days ago",  match:84,hot:true},
  {id:3, title:"Software Engineer II",   company:"Google",     logo:"🔍",location:"Hyderabad",     salary:"₹40–60 LPA", type:"Full-time",  skills:["C++","Algorithms","Distributed"],      posted:"1 week ago",  match:76,hot:false},
  {id:4, title:"Frontend Engineer",      company:"Figma",      logo:"🎨",location:"Remote",        salary:"$110k–$140k",type:"Full-time",  skills:["React","TypeScript","CSS"],            posted:"5 days ago",  match:88,hot:true},
  {id:5, title:"Junior Developer",       company:"Freshworks", logo:"🌿",location:"Chennai",       salary:"₹8–14 LPA",  type:"Full-time",  skills:["JavaScript","Python","SQL"],           posted:"1 day ago",   match:95,hot:true},
  {id:6, title:"DevOps Engineer",        company:"Netflix",    logo:"🎬",location:"Remote",        salary:"$140k–$180k",type:"Full-time",  skills:["Docker","Kubernetes","Terraform"],      posted:"2 weeks ago", match:62,hot:false},
  {id:7, title:"Data Engineer",          company:"Flipkart",   logo:"🛒",location:"Bengaluru",     salary:"₹22–35 LPA", type:"Full-time",  skills:["Spark","Python","Kafka"],              posted:"4 days ago",  match:71,hot:false},
  {id:8, title:"iOS Developer (Intern)", company:"CRED",       logo:"💎",location:"Bengaluru",     salary:"₹60k/month", type:"Internship", skills:["Swift","UIKit","CoreData"],            posted:"Today",       match:79,hot:true},
  {id:9, title:"ML Engineer",            company:"OpenAI",     logo:"🤖",location:"San Francisco", salary:"$160k–$220k",type:"Full-time",  skills:["Python","PyTorch","Transformers"],      posted:"3 days ago",  match:69,hot:false},
  {id:10,title:"Android Developer",      company:"Zomato",     logo:"🍕",location:"Gurugram",      salary:"₹18–30 LPA", type:"Full-time",  skills:["Kotlin","Jetpack","MVVM"],             posted:"Today",       match:83,hot:true},
  {id:11,title:"QA Automation Eng.",     company:"Atlassian",  logo:"🧩",location:"Remote",        salary:"$90k–$120k", type:"Full-time",  skills:["Selenium","Jest","Cypress"],           posted:"6 days ago",  match:73,hot:false},
  {id:12,title:"Security Engineer",      company:"Palo Alto",  logo:"🛡",location:"Remote",        salary:"$120k–$150k",type:"Full-time",  skills:["Pen Testing","Python","C"],            posted:"1 week ago",  match:55,hot:false},
];

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS=[
  {name:"Rohan Verma",  role:"Hired at Razorpay",   avatar:"RV",text:"SkillLens showed recruiters my actual abilities. Got my offer in 3 weeks.",           stars:5},
  {name:"Emma Clarke",  role:"Junior Dev @ Shopify", avatar:"EC",text:"The AI feedback pinpointed exactly what I was doing wrong. Total game-changer.",     stars:5},
  {name:"David Kim",    role:"SWE II @ Google",      avatar:"DK",text:"Integrity score gave me confidence to share my results publicly with recruiters.",    stars:5},
  {name:"Ananya Nair",  role:"Intern @ Freshworks",  avatar:"AN",text:"As a fresher, the certificate helped me stand out from 500+ applicants.",            stars:5},
];

// ── Notifications ─────────────────────────────────────────────────────────────
const NOTIFS_INIT=[
  {id:1,type:"job",  icon:"💼",msg:"New match: Junior Developer at Freshworks (95% match!)",          time:"2m ago",  read:false},
  {id:2,type:"badge",icon:"🏆",msg:"You earned the '3-Day Streak' badge! Keep it up.",                time:"1h ago",  read:false},
  {id:3,type:"rank", icon:"📈",msg:"You climbed to Rank #4 on the leaderboard this week!",            time:"3h ago",  read:true },
  {id:4,type:"tip",  icon:"💡",msg:"Tip: Practise Binary Search to improve your Arrays score.",        time:"1d ago",  read:true },
  {id:5,type:"job",  icon:"💼",msg:"Stripe viewed your SkillLens certificate.",                        time:"2d ago",  read:true },
  {id:6,type:"cert", icon:"📜",msg:"Your Two Sum certificate is ready to share.",                      time:"3d ago",  read:true },
];

// ── Auth Gate ─────────────────────────────────────────────────────────────────
const DUMMY_USERS=[
  {id:1,name:"Alex Rudewel",  email:"alex@skilllens.io",password:"password123",avatar:"AR",points:4525,streak:5,provider:"email"},
  {id:2,name:"Demo User",     email:"demo@demo.com",    password:"demo",        avatar:"DU",points:1200,streak:2,provider:"email"},
  {id:3,name:"Test Account",  email:"test@test.com",    password:"test123",     avatar:"TA",points:300, streak:1,provider:"email"},
];
const DUMMY_SOCIAL={
  google:  {id:10,name:"Google User",   avatar:"GU",points:800, streak:3,provider:"google"},
  github:  {id:11,name:"GitHub User",   avatar:"GH",points:620, streak:2,provider:"github"},
  linkedin:{id:12,name:"LinkedIn User", avatar:"LI",points:450, streak:1,provider:"linkedin"},
  apple:   {id:13,name:"Apple User",    avatar:"AP",points:300, streak:0,provider:"apple"},
};


export { C, CHALLENGES, LEADERBOARD, JOB_BOARD, TESTIMONIALS, NOTIFS_INIT, DUMMY_USERS, DUMMY_SOCIAL };

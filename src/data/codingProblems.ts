export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints?: string[];
  /** Legacy single-string solution (Python). Use `solutions[lang]` instead. */
  sampleSolution?: string;
  /** Per-language starter templates shown in the editor */
  starters?: Record<SupportedLanguage, string>;
  /** Per-language reference solutions shown when "View Solution" is clicked */
  solutions?: Record<SupportedLanguage, string>;
  /**
   * Per-language sets of implementation signals used by the evaluator.
   * Each entry is an array of token groups; a group is an array of synonyms —
   * the group is considered "matched" if ANY synonym is found in the code.
   * A solution passes when it matches enough groups (≥ coverageThreshold fraction).
   */
  evalSignals?: Record<SupportedLanguage, string[][]>;
  /** Fraction of evalSignal groups that must match for all tests to pass (default 0.5) */
  coverageThreshold?: number;
}

export type SupportedLanguage = 'python' | 'java' | 'cpp' | 'c';

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  python: 'Python',
  java:   'Java',
  cpp:    'C++',
  c:      'C',
};

export const CODING_PROBLEMS: CodingProblem[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // cp1 — Two Sum
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cp1',
    title: 'Two Sum',
    difficulty: 'easy',
    topic: 'Arrays',
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
    hints: [
      'Try every pair of indices — O(n²) brute force works but is slow.',
      'Use a hash map to store each number\'s index as you iterate.',
    ],
    evalSignals: {
      python: [
        ['dict', '{}', 'hashmap', 'seen', 'lookup'],   // hash structure
        ['for', 'enumerate', 'range'],                  // iteration
        ['target', 'complement', 'diff'],               // key computation
        ['return', '['],                                // result
      ],
      java: [
        ['HashMap', 'Map', 'Hashtable'],
        ['for', 'while'],
        ['target', 'complement', 'diff', 'sum'],
        ['return', 'new int'],
      ],
      cpp: [
        ['unordered_map', 'map<', 'map <'],
        ['for', 'while'],
        ['target', 'complement', 'diff'],
        ['return', 'push_back', 'vector'],
      ],
      c: [
        ['for', 'while'],
        ['target', 'complement', 'diff', 'sum'],
        ['result', 'return', 'malloc'],
        ['nums[', 'i', 'j'],
      ],
    },
    coverageThreshold: 0.5,
    sampleSolution: `# Python — O(n) hash map
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    solutions: {
      python: `# Python — O(n) hash map
def twoSum(nums, target):
    seen = {}           # value → index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      java: `// Java — O(n) HashMap
import java.util.HashMap;
class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement))
                return new int[]{ seen.get(complement), i };
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
      cpp: `// C++ — O(n) unordered_map
#include <vector>
#include <unordered_map>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int,int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement))
                return { seen[complement], i };
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      c: `// C — O(n²) brute force (no built-in hash map in C)
#include <stdlib.h>
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int* result = (int*)malloc(2 * sizeof(int));
    *returnSize = 2;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    return result;
}`,
    },
    starters: {
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Your code here
    pass`,
      java: `import java.util.*;
class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};`,
      c: `#include <stdlib.h>
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int* result = malloc(2 * sizeof(int));
    *returnSize = 2;
    // Your code here
    return result;
}`,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // cp2 — Valid Parentheses
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cp2',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    topic: 'Stacks',
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only.'],
    hints: [
      'Use a stack — push opening brackets, pop on closing ones.',
      'At the end, the stack must be empty for the string to be valid.',
    ],
    evalSignals: {
      python: [
        ['stack', '[]', 'append', 'pop'],
        ['for', 'in s', 'char', 'c in'],
        ['return', 'not stack', 'len(stack)'],
        [')', '}', ']', 'mapping', 'match'],
      ],
      java: [
        ['Stack', 'Deque', 'ArrayDeque', 'LinkedList'],
        ['push', 'pop', 'peek', 'isEmpty'],
        ['for', 'char', 'charAt'],
        ['return', 'isEmpty'],
      ],
      cpp: [
        ['stack', 'Stack'],
        ['push', 'pop', 'top', 'empty'],
        ['for', 'while', 'char', 'c :'],
        ['return'],
      ],
      c: [
        ['char', 'stack', 'arr', 'buf'],
        ['for', 'while', 's['],
        ['top', 'idx', 'index', 'count'],
        ['return'],
      ],
    },
    coverageThreshold: 0.5,
    sampleSolution: `# Python — Stack O(n)
def isValid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
    solutions: {
      python: `# Python — Stack O(n)
def isValid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
      java: `// Java — Stack O(n)
import java.util.Stack;
class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }
}`,
      cpp: `// C++ — Stack O(n)
#include <stack>
#include <string>
using namespace std;
class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty()) return false;
                char top = st.top(); st.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return st.empty();
    }
};`,
      c: `// C — Array-based stack O(n)
#include <stdbool.h>
#include <string.h>
bool isValid(char* s) {
    int n = strlen(s);
    char stack[n + 1];
    int top = -1;
    for (int i = 0; s[i]; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top < 0) return false;
            char t = stack[top--];
            if (c == ')' && t != '(') return false;
            if (c == '}' && t != '{') return false;
            if (c == ']' && t != '[') return false;
        }
    }
    return top == -1;
}`,
    },
    starters: {
      python: `def isValid(s: str) -> bool:
    # Your code here
    pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }
}`,
      cpp: `#include <stack>
#include <string>
using namespace std;
class Solution {
public:
    bool isValid(string s) {
        // Your code here
        return false;
    }
};`,
      c: `#include <stdbool.h>
bool isValid(char* s) {
    // Your code here
    return false;
}`,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // cp3 — Reverse Linked List
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cp3',
    title: 'Reverse Linked List',
    difficulty: 'easy',
    topic: 'Linked Lists',
    description: 'Given the head of a singly linked list, reverse the list and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
    ],
    constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 <= Node.val <= 5000'],
    hints: [
      'Use three pointers: prev, current, next.',
      'Alternatively, solve it recursively.',
    ],
    evalSignals: {
      python: [
        ['prev', 'previous'],
        ['curr', 'current', 'node'],
        ['while', 'for'],
        ['.next', 'next_node', 'nxt'],
      ],
      java: [
        ['prev', 'previous'],
        ['curr', 'current', 'node'],
        ['while', 'for'],
        ['.next', 'next'],
      ],
      cpp: [
        ['prev', 'previous'],
        ['curr', 'current', 'node'],
        ['while', 'for'],
        ['->next', '.next'],
      ],
      c: [
        ['prev', 'previous'],
        ['curr', 'current', 'node'],
        ['while', 'for'],
        ['->next', 'next'],
      ],
    },
    coverageThreshold: 0.5,
    sampleSolution: `# Python — Iterative O(n)
def reverseList(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev`,
    solutions: {
      python: `# Python — Iterative O(n)
def reverseList(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev`,
      java: `// Java — Iterative O(n)
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}`,
      cpp: `// C++ — Iterative O(n)
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr) {
            ListNode* next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
};`,
      c: `// C — Iterative O(n)
struct ListNode* reverseList(struct ListNode* head) {
    struct ListNode* prev = NULL;
    struct ListNode* curr = head;
    while (curr) {
        struct ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    },
    starters: {
      python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head):
    # Your code here
    pass`,
      java: `class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
        return null;
    }
}`,
      cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Your code here
        return nullptr;
    }
};`,
      c: `struct ListNode* reverseList(struct ListNode* head) {
    // Your code here
    return NULL;
}`,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // cp4 — Binary Search
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cp4',
    title: 'Binary Search',
    difficulty: 'easy',
    topic: 'Binary Search',
    description:
      'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    constraints: ['1 <= nums.length <= 10^4', 'All integers in nums are unique.'],
    hints: [
      'Maintain left and right pointers.',
      'Compute mid = (left + right) // 2 each iteration and compare to target.',
    ],
    evalSignals: {
      python: [
        ['left', 'lo', 'low'],
        ['right', 'hi', 'high'],
        ['mid', 'middle', 'm'],
        ['while', 'left <= right', 'lo <= hi'],
      ],
      java: [
        ['left', 'lo', 'low'],
        ['right', 'hi', 'high'],
        ['mid', 'middle'],
        ['while'],
      ],
      cpp: [
        ['left', 'lo', 'low'],
        ['right', 'hi', 'high'],
        ['mid', 'middle'],
        ['while'],
      ],
      c: [
        ['left', 'lo', 'low'],
        ['right', 'hi', 'high'],
        ['mid', 'middle'],
        ['while'],
      ],
    },
    coverageThreshold: 0.75,
    sampleSolution: `# Python — O(log n)
def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    solutions: {
      python: `# Python — O(log n)
def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      java: `// Java — O(log n)
class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
      cpp: `// C++ — O(log n)
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = (int)nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};`,
      c: `// C — O(log n)
int search(int* nums, int numsSize, int target) {
    int left = 0, right = numsSize - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    },
    starters: {
      python: `def search(nums: list[int], target: int) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Your code here
        return -1;
    }
}`,
      cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Your code here
        return -1;
    }
};`,
      c: `int search(int* nums, int numsSize, int target) {
    // Your code here
    return -1;
}`,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // cp5 — Longest Substring Without Repeating Characters
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cp5',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium',
    topic: 'Sliding Window',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    hints: [
      'Use a sliding window with a Set or Map to track characters.',
      'When a duplicate is found, shrink the window from the left.',
    ],
    evalSignals: {
      python: [
        ['set(', 'dict', '{', 'seen', 'char_index', 'window'],
        ['left', 'start', 'l'],
        ['right', 'end', 'r', 'for', 'enumerate'],
        ['max', 'max_len', 'result', 'ans'],
      ],
      java: [
        ['HashSet', 'HashMap', 'Set', 'Map', 'array', 'int[]'],
        ['left', 'start', 'l'],
        ['right', 'end', 'r', 'for'],
        ['Math.max', 'max', 'result'],
      ],
      cpp: [
        ['unordered_set', 'unordered_map', 'set<', 'map<', 'int['],
        ['left', 'start', 'l'],
        ['right', 'end', 'r', 'for'],
        ['max', 'result', 'ans'],
      ],
      c: [
        ['int', 'char', 'seen', 'visited', 'last'],
        ['left', 'start', 'l'],
        ['right', 'i', 'for'],
        ['max', 'result', 'ans', 'len'],
      ],
    },
    coverageThreshold: 0.5,
    sampleSolution: `# Python — O(n) sliding window
def lengthOfLongestSubstring(s):
    char_index = {}
    left = max_len = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
    solutions: {
      python: `# Python — O(n) sliding window
def lengthOfLongestSubstring(s):
    char_index = {}
    left = max_len = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
      java: `// Java — O(n) sliding window
import java.util.HashMap;
class Solution {
    public int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left)
                left = map.get(c) + 1;
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
      cpp: `// C++ — O(n) sliding window
#include <unordered_map>
#include <string>
using namespace std;
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char,int> idx;
        int left = 0, maxLen = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            if (idx.count(s[right]) && idx[s[right]] >= left)
                left = idx[s[right]] + 1;
            idx[s[right]] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`,
      c: `// C — O(n) using last-seen index array
int lengthOfLongestSubstring(char* s) {
    int last[256];
    for (int i = 0; i < 256; i++) last[i] = -1;
    int left = 0, maxLen = 0;
    for (int right = 0; s[right]; right++) {
        unsigned char c = (unsigned char)s[right];
        if (last[c] >= left) left = last[c] + 1;
        last[c] = right;
        int len = right - left + 1;
        if (len > maxLen) maxLen = len;
    }
    return maxLen;
}`,
    },
    starters: {
      python: `def lengthOfLongestSubstring(s: str) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Your code here
        return 0;
    }
};`,
      c: `int lengthOfLongestSubstring(char* s) {
    // Your code here
    return 0;
}`,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // cp6 — Maximum Subarray
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cp6',
    title: 'Maximum Subarray',
    difficulty: 'medium',
    topic: 'Dynamic Programming',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    hints: [
      "Kadane's Algorithm: maintain a running sum.",
      'If running sum goes below 0, reset it to the current element.',
    ],
    evalSignals: {
      python: [
        ['current', 'curr', 'running', 'local'],
        ['max', 'max_sum', 'best', 'global', 'result'],
        ['for', 'in nums', 'range'],
        ['nums[0]', 'nums[i]', 'num'],
      ],
      java: [
        ['current', 'curr', 'running', 'local', 'curMax'],
        ['max', 'maxSum', 'best', 'globalMax', 'result'],
        ['for', 'nums['],
        ['Math.max'],
      ],
      cpp: [
        ['current', 'curr', 'running', 'local'],
        ['max', 'maxSum', 'best', 'result', 'ans'],
        ['for', 'nums[', 'num :'],
        ['max(', 'INT_MIN', 'nums[0]'],
      ],
      c: [
        ['current', 'curr', 'running', 'local', 'cur'],
        ['max', 'maxSum', 'best', 'result', 'ans'],
        ['for', 'nums['],
        ['nums[0]', 'i'],
      ],
    },
    coverageThreshold: 0.5,
    sampleSolution: `# Python — Kadane's Algorithm O(n)
def maxSubArray(nums):
    current = max_sum = nums[0]
    for num in nums[1:]:
        current = max(num, current + num)
        max_sum = max(max_sum, current)
    return max_sum`,
    solutions: {
      python: `# Python — Kadane's Algorithm O(n)
def maxSubArray(nums):
    current = max_sum = nums[0]
    for num in nums[1:]:
        current = max(num, current + num)
        max_sum = max(max_sum, current)
    return max_sum`,
      java: `// Java — Kadane's Algorithm O(n)
class Solution {
    public int maxSubArray(int[] nums) {
        int current = nums[0], maxSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            current = Math.max(nums[i], current + nums[i]);
            maxSum  = Math.max(maxSum, current);
        }
        return maxSum;
    }
}`,
      cpp: `// C++ — Kadane's Algorithm O(n)
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int current = nums[0], maxSum = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            current = max(nums[i], current + nums[i]);
            maxSum  = max(maxSum, current);
        }
        return maxSum;
    }
};`,
      c: `// C — Kadane's Algorithm O(n)
int maxSubArray(int* nums, int numsSize) {
    int current = nums[0], maxSum = nums[0];
    for (int i = 1; i < numsSize; i++) {
        current = current + nums[i] > nums[i] ? current + nums[i] : nums[i];
        if (current > maxSum) maxSum = current;
    }
    return maxSum;
}`,
    },
    starters: {
      python: `def maxSubArray(nums: list[int]) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Your code here
        return 0;
    }
};`,
      c: `int maxSubArray(int* nums, int numsSize) {
    // Your code here
    return 0;
}`,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // cp7 — Number of Islands
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cp7',
    title: 'Number of Islands',
    difficulty: 'medium',
    topic: 'Graph / BFS-DFS',
    description:
      "Given an m x n 2D binary grid representing a map of '1's (land) and '0's (water), return the number of islands.",
    examples: [
      { input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: '2' },
    ],
    constraints: ['1 <= m, n <= 300', "grid[i][j] is '0' or '1'."],
    hints: [
      'Use DFS or BFS to flood-fill (sink) each island.',
      'Each time you start a new DFS from an unvisited land cell, increment the island count.',
    ],
    evalSignals: {
      python: [
        ['dfs', 'bfs', 'def dfs', 'def bfs', 'queue', 'deque'],
        ['for', 'range', 'enumerate'],
        ['count', 'islands', 'result', 'ans'],
        ['grid[', "'1'", '"1"', '1'],
      ],
      java: [
        ['dfs', 'bfs', 'Queue', 'Stack', 'void dfs', 'void bfs'],
        ['for', 'grid['],
        ['count', 'islands', 'result'],
        ["'1'", "'0'"],
      ],
      cpp: [
        ['dfs', 'bfs', 'queue<', 'stack<'],
        ['for', 'grid['],
        ['count', 'islands', 'result'],
        ["'1'", "'0'"],
      ],
      c: [
        ['dfs', 'bfs', 'void dfs', 'void bfs'],
        ['for', 'grid['],
        ['count', 'islands', 'result'],
        ["'1'", "'0'"],
      ],
    },
    coverageThreshold: 0.5,
    sampleSolution: `# Python — DFS O(m×n)
def numIslands(grid):
    def dfs(r, c):
        if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]) or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)
    count = 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == '1':
                dfs(r, c)
                count += 1
    return count`,
    solutions: {
      python: `# Python — DFS O(m×n)
def numIslands(grid):
    def dfs(r, c):
        if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]) or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)
    count = 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == '1':
                dfs(r, c)
                count += 1
    return count`,
      java: `// Java — DFS O(m×n)
class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++)
                if (grid[r][c] == '1') { dfs(grid, r, c); count++; }
        return count;
    }
    void dfs(char[][] grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid,r+1,c); dfs(grid,r-1,c); dfs(grid,r,c+1); dfs(grid,r,c-1);
    }
}`,
      cpp: `// C++ — DFS O(m×n)
class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int count = 0;
        for (int r = 0; r < (int)grid.size(); r++)
            for (int c = 0; c < (int)grid[0].size(); c++)
                if (grid[r][c] == '1') { dfs(grid, r, c); count++; }
        return count;
    }
    void dfs(vector<vector<char>>& grid, int r, int c) {
        if (r < 0 || c < 0 || r >= (int)grid.size() || c >= (int)grid[0].size() || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid,r+1,c); dfs(grid,r-1,c); dfs(grid,r,c+1); dfs(grid,r,c-1);
    }
};`,
      c: `// C — DFS O(m×n)
int rows, cols;
void dfs(char** grid, int r, int c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] != '1') return;
    grid[r][c] = '0';
    dfs(grid,r+1,c); dfs(grid,r-1,c); dfs(grid,r,c+1); dfs(grid,r,c-1);
}
int numIslands(char** grid, int gridSize, int* gridColSize) {
    rows = gridSize; cols = gridColSize[0];
    int count = 0;
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (grid[r][c] == '1') { dfs(grid, r, c); count++; }
    return count;
}`,
    },
    starters: {
      python: `def numIslands(grid: list[list[str]]) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int numIslands(char[][] grid) {
        // Your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        // Your code here
        return 0;
    }
};`,
      c: `int numIslands(char** grid, int gridSize, int* gridColSize) {
    // Your code here
    return 0;
}`,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // cp8 — Word Break
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cp8',
    title: 'Word Break',
    difficulty: 'medium',
    topic: 'Dynamic Programming',
    description:
      'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true' },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true' },
    ],
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000'],
    hints: [
      'Create a boolean DP array dp[0..n] where dp[i] means s[0..i-1] can be segmented.',
      'dp[0] = True. For each i, check all j < i where dp[j] is true and s[j..i] is in the dictionary.',
    ],
    evalSignals: {
      python: [
        ['dp', 'memo', 'cache', 'visited'],
        ['set(', 'wordDict', 'word_set'],
        ['for', 'range', 'while'],
        ['dp[0]', 'True', 'dp[i]', 'dp[j]'],
      ],
      java: [
        ['dp', 'memo', 'boolean[]'],
        ['Set', 'HashSet', 'wordDict', 'wordSet'],
        ['for', 'while'],
        ['dp[0]', 'true', 'dp[i]', 'dp[j]'],
      ],
      cpp: [
        ['dp', 'memo', 'vector<bool>'],
        ['set<', 'unordered_set', 'wordDict', 'wordSet'],
        ['for', 'while'],
        ['dp[0]', 'true', 'dp[i]', 'dp[j]'],
      ],
      c: [
        ['dp', 'memo', 'bool', 'int'],
        ['for', 'while'],
        ['dp[0]', '1', 'true', 'dp[i]'],
        ['strncmp', 'substr', 's[', 'strcmp'],
      ],
    },
    coverageThreshold: 0.5,
    sampleSolution: `# Python — DP O(n²)
def wordBreak(s, wordDict):
    word_set = set(wordDict)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break
    return dp[len(s)]`,
    solutions: {
      python: `# Python — DP O(n²)
def wordBreak(s, wordDict):
    word_set = set(wordDict)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break
    return dp[len(s)]`,
      java: `// Java — DP O(n²)
import java.util.*;
class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> wordSet = new HashSet<>(wordDict);
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true;
        for (int i = 1; i <= s.length(); i++)
            for (int j = 0; j < i; j++)
                if (dp[j] && wordSet.contains(s.substring(j, i))) { dp[i] = true; break; }
        return dp[s.length()];
    }
}`,
      cpp: `// C++ — DP O(n²)
#include <vector>
#include <unordered_set>
#include <string>
using namespace std;
class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> wordSet(wordDict.begin(), wordDict.end());
        int n = s.size();
        vector<bool> dp(n + 1, false);
        dp[0] = true;
        for (int i = 1; i <= n; i++)
            for (int j = 0; j < i; j++)
                if (dp[j] && wordSet.count(s.substr(j, i - j))) { dp[i] = true; break; }
        return dp[n];
    }
};`,
      c: `// C — DP O(n²) with strncmp
#include <stdbool.h>
#include <string.h>
bool wordBreak(char* s, char** wordDict, int wordDictSize) {
    int n = strlen(s);
    bool dp[n + 1];
    for (int i = 0; i <= n; i++) dp[i] = false;
    dp[0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) {
            if (!dp[j]) continue;
            int len = i - j;
            for (int k = 0; k < wordDictSize; k++) {
                if ((int)strlen(wordDict[k]) == len && strncmp(s + j, wordDict[k], len) == 0) {
                    dp[i] = true; break;
                }
            }
            if (dp[i]) break;
        }
    }
    return dp[n];
}`,
    },
    starters: {
      python: `def wordBreak(s: str, wordDict: list[str]) -> bool:
    # Your code here
    pass`,
      java: `class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        // Your code here
        return false;
    }
}`,
      cpp: `class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        // Your code here
        return false;
    }
};`,
      c: `bool wordBreak(char* s, char** wordDict, int wordDictSize) {
    // Your code here
    return false;
}`,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // cp9 — Merge K Sorted Lists
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cp9',
    title: 'Merge K Sorted Lists',
    difficulty: 'hard',
    topic: 'Heaps / Merge',
    description:
      'You are given an array of k linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
    ],
    constraints: ['k == lists.length', '0 <= k <= 10^4'],
    hints: [
      'Use a min-heap (priority queue) and push the head of each list.',
      'Alternatively, merge lists two at a time (divide & conquer).',
    ],
    evalSignals: {
      python: [
        ['heapq', 'heap', 'PriorityQueue', 'sorted', 'merge'],
        ['heappush', 'heappop', 'push', 'pop', 'append'],
        ['for', 'while'],
        ['dummy', 'curr', 'current', 'head', 'node'],
      ],
      java: [
        ['PriorityQueue', 'heap', 'TreeMap', 'merge'],
        ['add', 'offer', 'poll', 'peek'],
        ['for', 'while'],
        ['dummy', 'curr', 'current', 'ListNode'],
      ],
      cpp: [
        ['priority_queue', 'heap', 'merge'],
        ['push', 'pop', 'top'],
        ['for', 'while'],
        ['dummy', 'curr', 'current', 'ListNode'],
      ],
      c: [
        ['merge', 'sort', 'heap', 'for', 'while'],
        ['next', '->next'],
        ['dummy', 'curr', 'current', 'head'],
        ['NULL', 'node'],
      ],
    },
    coverageThreshold: 0.5,
    sampleSolution: `# Python — Min-heap O(N log k)
import heapq
def mergeKLists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))
    dummy = curr = ListNode(0)
    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next`,
    solutions: {
      python: `# Python — Min-heap O(N log k)
import heapq
def mergeKLists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))
    dummy = curr = type('Node', (), {'next': None})()
    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next`,
      java: `// Java — PriorityQueue O(N log k)
import java.util.PriorityQueue;
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode node : lists)
            if (node != null) pq.add(node);
        ListNode dummy = new ListNode(0), curr = dummy;
        while (!pq.isEmpty()) {
            curr.next = pq.poll();
            curr = curr.next;
            if (curr.next != null) pq.add(curr.next);
        }
        return dummy.next;
    }
}`,
      cpp: `// C++ — priority_queue O(N log k)
#include <queue>
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto cmp = [](ListNode* a, ListNode* b){ return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
        for (auto node : lists) if (node) pq.push(node);
        ListNode dummy(0); ListNode* curr = &dummy;
        while (!pq.empty()) {
            curr->next = pq.top(); pq.pop();
            curr = curr->next;
            if (curr->next) pq.push(curr->next);
        }
        return dummy.next;
    }
};`,
      c: `// C — Merge two lists repeatedly O(N log k)
struct ListNode* mergeTwoLists(struct ListNode* l1, struct ListNode* l2) {
    struct ListNode dummy; struct ListNode* curr = &dummy;
    while (l1 && l2) {
        if (l1->val <= l2->val) { curr->next = l1; l1 = l1->next; }
        else                    { curr->next = l2; l2 = l2->next; }
        curr = curr->next;
    }
    curr->next = l1 ? l1 : l2;
    return dummy.next;
}
struct ListNode* mergeKLists(struct ListNode** lists, int listsSize) {
    if (listsSize == 0) return NULL;
    struct ListNode* result = lists[0];
    for (int i = 1; i < listsSize; i++)
        result = mergeTwoLists(result, lists[i]);
    return result;
}`,
    },
    starters: {
      python: `import heapq
def mergeKLists(lists):
    # Your code here
    pass`,
      java: `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        // Your code here
        return null;
    }
}`,
      cpp: `class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        // Your code here
        return nullptr;
    }
};`,
      c: `struct ListNode* mergeKLists(struct ListNode** lists, int listsSize) {
    // Your code here
    return NULL;
}`,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // cp10 — Trapping Rain Water
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cp10',
    title: 'Trapping Rain Water',
    difficulty: 'hard',
    topic: 'Two Pointers',
    description:
      'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    hints: [
      'Two-pointer approach: maintain left and right pointers.',
      'Water at position i = min(max_left, max_right) − height[i].',
    ],
    evalSignals: {
      python: [
        ['left', 'lo', 'l'],
        ['right', 'hi', 'r'],
        ['while', 'left < right', 'lo < hi'],
        ['water', 'result', 'ans', 'total'],
      ],
      java: [
        ['left', 'lo'],
        ['right', 'hi'],
        ['while'],
        ['water', 'result', 'ans', 'total'],
      ],
      cpp: [
        ['left', 'lo'],
        ['right', 'hi'],
        ['while'],
        ['water', 'result', 'ans', 'total'],
      ],
      c: [
        ['left', 'lo'],
        ['right', 'hi'],
        ['while'],
        ['water', 'result', 'ans', 'total'],
      ],
    },
    coverageThreshold: 0.75,
    sampleSolution: `# Python — Two pointers O(n)
def trap(height):
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    while left < right:
        if height[left] < height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]
            right -= 1
    return water`,
    solutions: {
      python: `# Python — Two pointers O(n)
def trap(height):
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    while left < right:
        if height[left] < height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]
            right -= 1
    return water`,
      java: `// Java — Two pointers O(n)
class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                leftMax = Math.max(leftMax, height[left]);
                water += leftMax - height[left++];
            } else {
                rightMax = Math.max(rightMax, height[right]);
                water += rightMax - height[right--];
            }
        }
        return water;
    }
}`,
      cpp: `// C++ — Two pointers O(n)
class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = (int)height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                leftMax = max(leftMax, height[left]);
                water += leftMax - height[left++];
            } else {
                rightMax = max(rightMax, height[right]);
                water += rightMax - height[right--];
            }
        }
        return water;
    }
};`,
      c: `// C — Two pointers O(n)
int trap(int* height, int heightSize) {
    int left = 0, right = heightSize - 1;
    int leftMax = 0, rightMax = 0, water = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) leftMax = height[left];
            else water += leftMax - height[left];
            left++;
        } else {
            if (height[right] >= rightMax) rightMax = height[right];
            else water += rightMax - height[right];
            right--;
        }
    }
    return water;
}`,
    },
    starters: {
      python: `def trap(height: list[int]) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int trap(int[] height) {
        // Your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        // Your code here
        return 0;
    }
};`,
      c: `int trap(int* height, int heightSize) {
    // Your code here
    return 0;
}`,
    },
  },
];

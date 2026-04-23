// ============================================================
// utils/testRunner.js - Smart Test Execution Wrapper
// Wraps user code with proper test execution and output
// ============================================================

export function wrapCodeForTesting(language, userCode, functionName, testCases) {
  switch (language) {
    case 'javascript':
      return wrapJavaScript(userCode, functionName, testCases);
    case 'python':
      return wrapPython(userCode, functionName, testCases);
    case 'java':
      return wrapJava(userCode, functionName, testCases);
    case 'cpp':
      return wrapCpp(userCode, functionName, testCases);
    case 'c':
      return wrapC(userCode, functionName, testCases);
    case 'go':
      return wrapGo(userCode, functionName, testCases);
    case 'rust':
      return wrapRust(userCode, functionName, testCases);
    default:
      return userCode;
  }
}

// ── JavaScript Wrapper ───────────────────────────────────────
function wrapJavaScript(userCode, functionName, testCases) {
  // Extract function name if not provided
  if (!functionName) {
    const functionMatch = userCode.match(/function\s+(\w+)\s*\(/);
    if (functionMatch) {
      functionName = functionMatch[1];
    } else {
      const arrowMatch = userCode.match(/const\s+(\w+)\s*=\s*\(/);
      if (arrowMatch) {
        functionName = arrowMatch[1];
      } else {
        // Default to common function names
        functionName = 'twoSum'; // Default for two sum problem
      }
    }
  }

  let testCode = `
// User's code
${userCode}

// Test execution
try {
  const testCases = ${JSON.stringify(testCases)};
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    let input;
    try {
      // Parse input string to create actual parameters
      input = parseInput(testCase.input);
    } catch (e) {
      console.error(\`Error parsing input for test case \${i + 1}:\`, e);
      console.log(\`Test \${i + 1}: Input parsing error\`);
      continue;
    }
    
    try {
      let result;
      if (input.isArray) {
        result = ${functionName}(...input.values);
      } else if (input.object) {
        result = ${functionName}(input.object);
      } else {
        result = ${functionName}(input.value);
      }
      
      const output = JSON.stringify(result);
      const expected = testCase.expected;
      const passed = output === expected || output === expected.replace(/\s/g, '');
      
      results.push({
        test: i + 1,
        input: testCase.input,
        output: output,
        expected: expected,
        passed: passed
      });
      
      console.log(\`Test \${i + 1}: \${passed ? 'PASS' : 'FAIL'}\`);
      if (!passed) {
        console.log(\`  Expected: \${expected}\`);
        console.log(\`  Got: \${output}\`);
      }
    } catch (e) {
      console.error(\`Error in test case \${i + 1}:\`, e);
      console.log(\`Test \${i + 1}: ERROR - \${e.message}\`);
      results.push({
        test: i + 1,
        input: testCase.input,
        output: 'ERROR',
        expected: testCase.expected,
        passed: false,
        error: e.message
      });
    }
  }
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(\`\\nSummary: \${passed}/\${total} tests passed\`);
  
  if (passed === total) {
    console.log('All tests passed! 🎉');
  }
  
} catch (e) {
  console.error('Test execution error:', e);
  console.log('Test execution failed:', e.message);
}

// Input parsing helper
function parseInput(inputStr) {
  inputStr = inputStr.trim();
  
  // Handle array format: [2,7,11,15], 9
  if (inputStr.includes('[') && inputStr.includes('],')) {
    const parts = inputStr.split('],');
    if (parts.length === 2) {
      const arrayPart = parts[0] + ']';
      const secondPart = parts[1].trim();
      
      try {
        const arrayValue = JSON.parse(arrayPart);
        const secondValue = JSON.parse(secondPart);
        return {
          isArray: true,
          values: [arrayValue, secondValue]
        };
      } catch (e) {
        // If JSON parsing fails, try manual parsing
        const arrayMatch = arrayPart.match(/\[([^\]]+)\]/);
        if (arrayMatch) {
          const arrayItems = arrayMatch[1].split(',').map(item => parseInt(item.trim()));
          const secondValue = parseInt(secondPart);
          return {
            isArray: true,
            values: [arrayItems, secondValue]
          };
        }
      }
    }
  }
  
  // Handle single value
  try {
    const value = JSON.parse(inputStr);
    return { value: value };
  } catch (e) {
    // Try as number
    const num = parseInt(inputStr);
    if (!isNaN(num)) {
      return { value: num };
    }
    // Return as string
    return { value: inputStr };
  }
}
`;

  return testCode;
}

// ── Python Wrapper ───────────────────────────────────────────
function wrapPython(userCode, functionName, testCases) {
  // Extract function name if not provided
  if (!functionName) {
    const functionMatch = userCode.match(/def\s+(\w+)\s*\(/);
    if (functionMatch) {
      functionName = functionMatch[1];
    }
  }

  return `
# User's code
${userCode}

# Test execution
import json
import sys

def parse_input(input_str):
    input_str = input_str.strip()
    
    # Handle array format: [2,7,11,15], 9
    if '[' in input_str and '],' in input_str:
        parts = input_str.split('],')
        if len(parts) == 2:
            array_part = parts[0] + ']'
            second_part = parts[1].strip()
            
            try:
                array_value = json.loads(array_part)
                second_value = json.loads(second_part)
                return {'isArray': True, 'values': [array_value, second_value]}
            except:
                # Manual parsing
                array_match = array_part.match(r'\[([^\]]+)\]')
                if array_match:
                    array_items = [int(x.strip()) for x in array_match.group(1).split(',')]
                    second_value = int(second_part)
                    return {'isArray': True, 'values': [array_items, second_value]}
    
    # Handle single value
    try:
        value = json.loads(input_str)
        return {'value': value}
    except:
        try:
            return {'value': int(input_str)}
        except:
            return {'value': input_str}

def main():
    try:
        test_cases = ${JSON.stringify(testCases)}
        results = []
        
        for i, test_case in enumerate(test_cases):
            try:
                input_data = parse_input(test_case['input'])
                
                if input_data.get('isArray'):
                    result = ${functionName}(*input_data['values'])
                else:
                    result = ${functionName}(input_data['value'])
                
                output = json.dumps(result)
                expected = test_case['expected']
                passed = output == expected or output.replace(' ', '') == expected.replace(' ', '')
                
                results.append({
                    'test': i + 1,
                    'input': test_case['input'],
                    'output': output,
                    'expected': expected,
                    'passed': passed
                })
                
                print(f"Test {i + 1}: {'PASS' if passed else 'FAIL'}")
                if not passed:
                    print(f"  Expected: {expected}")
                    print(f"  Got: {output}")
                    
            except Exception as e:
                print(f"Error in test case {i + 1}: {e}")
                print(f"Test {i + 1}: ERROR - {e}")
                results.append({
                    'test': i + 1,
                    'input': test_case['input'],
                    'output': 'ERROR',
                    'expected': test_case['expected'],
                    'passed': False,
                    'error': str(e)
                })
        
        # Summary
        passed = sum(1 for r in results if r['passed'])
        total = len(results)
        print(f"\\nSummary: {passed}/{total} tests passed")
        
        if passed == total:
            print("All tests passed! 🎉")
            
    except Exception as e:
        print(f"Test execution error: {e}")

if __name__ == "__main__":
    main()
`;
}

// ── Java Wrapper ─────────────────────────────────────────────
function wrapJava(userCode, functionName, testCases) {
  return `
// User's code
${userCode}

// Test execution
import java.util.*;
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) {
        try {
            String[][] testCases = ${JSON.stringify(testCases)};
            
            for (int i = 0; i < testCases.length; i++) {
                String[] testCase = testCases[i];
                String input = testCase[0];
                String expected = testCase[1];
                
                try {
                    // Parse input and call function
                    Object result = executeTest(input);
                    String output = result.toString();
                    
                    boolean passed = output.equals(expected) || 
                                    output.replaceAll("\\s", "").equals(expected.replaceAll("\\s", ""));
                    
                    System.out.println("Test " + (i + 1) + ": " + (passed ? "PASS" : "FAIL"));
                    if (!passed) {
                        System.out.println("  Expected: " + expected);
                        System.out.println("  Got: " + output);
                    }
                } catch (Exception e) {
                    System.out.println("Error in test case " + (i + 1) + ": " + e.getMessage());
                    System.out.println("Test " + (i + 1) + ": ERROR - " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.out.println("Test execution error: " + e.getMessage());
        }
    }
    
    private static Object executeTest(String input) throws Exception {
        // Parse input like "[2,7,11,15], 9"
        if (input.contains("[") && input.contains("],")) {
            String[] parts = input.split("],");
            if (parts.length == 2) {
                String arrayPart = parts[0] + "]";
                String secondPart = parts[1].trim();
                
                // Parse array
                arrayPart = arrayPart.substring(1, arrayPart.length() - 1); // Remove brackets
                String[] elements = arrayPart.split(",");
                int[] nums = new int[elements.length];
                for (int j = 0; j < elements.length; j++) {
                    nums[j] = Integer.parseInt(elements[j].trim());
                }
                
                int target = Integer.parseInt(secondPart);
                
                // Call Solution class method
                Solution solution = new Solution();
                return solution.twoSum(nums, target);
            }
        }
        
        throw new IllegalArgumentException("Cannot parse input: " + input);
    }
}
`;
}

// ── C++ Wrapper ─────────────────────────────────────────────
function wrapCpp(userCode, functionName, testCases) {
  return `
// User's code
${userCode}

#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

vector<int> parseInput(const string& input) {
    vector<int> result;
    
    // Parse array format: [2,7,11,15], 9
    if (input.find('[') != string::npos && input.find('],') != string::npos) {
        size_t bracketPos = input.find(']');
        string arrayStr = input.substr(0, bracketPos + 1);
        string secondStr = input.substr(bracketPos + 2);
        
        // Remove brackets and split by comma
        arrayStr = arrayStr.substr(1, arrayStr.length() - 2);
        stringstream ss(arrayStr);
        string item;
        
        while (getline(ss, item, ',')) {
            result.push_back(stoi(item));
        }
        
        result.push_back(stoi(secondStr));
    }
    
    return result;
}

string arrayToString(const vector<int>& arr) {
    string result = "[";
    for (size_t i = 0; i < arr.size(); ++i) {
        if (i > 0) result += ",";
        result += to_string(arr[i]);
    }
    result += "]";
    return result;
}

int main() {
    vector<string> testCases = ${JSON.stringify(testCases.map(tc => tc.input))};
    vector<string> expectedOutputs = ${JSON.stringify(testCases.map(tc => tc.expected))};
    
    int passed = 0;
    
    for (size_t i = 0; i < testCases.size(); ++i) {
        try {
            vector<int> input = parseInput(testCases[i]);
            vector<int> nums(input.begin(), input.end() - 1);
            int target = input.back();
            
            vector<int> result = twoSum(nums, target);
            string output = arrayToString(result);
            string expected = expectedOutputs[i];
            
            bool isPass = (output == expected);
            if (isPass) passed++;
            
            cout << "Test " << (i + 1) << ": " << (isPass ? "PASS" : "FAIL") << endl;
            if (!isPass) {
                cout << "  Expected: " << expected << endl;
                cout << "  Got: " << output << endl;
            }
        } catch (exception& e) {
            cout << "Error in test case " << (i + 1) << ": " << e.what() << endl;
            cout << "Test " << (i + 1) << ": ERROR - " << e.what() << endl;
        }
    }
    
    cout << "\\nSummary: " << passed << "/" << testCases.size() << " tests passed" << endl;
    if (passed == testCases.size()) {
        cout << "All tests passed! 🎉" << endl;
    }
    
    return 0;
}
`;
}

// ── C Wrapper ───────────────────────────────────────────────
function wrapC(userCode, functionName, testCases) {
  return `
// User's code
${userCode}

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int* parseInput(const char* input, int* numsSize, int* target) {
    // Simple parsing for [2,7,11,15], 9 format
    static int result[100];
    int count = 0;
    
    char* inputCopy = strdup(input);
    char* bracket = strchr(inputCopy, ']');
    if (bracket) {
        *bracket = '\\0';
        char* arrayStart = strchr(inputCopy, '[');
        if (arrayStart) {
            arrayStart++;
            char* token = strtok(arrayStart, ",");
            while (token && count < 99) {
                result[count++] = atoi(token);
                token = strtok(NULL, ",");
            }
        }
        char* secondPart = bracket + 2;
        *target = atoi(secondPart);
    }
    
    free(inputCopy);
    *numsSize = count - 1;
    return result;
}

void printArray(int* arr, int size) {
    printf("[");
    for (int i = 0; i < size; i++) {
        if (i > 0) printf(",");
        printf("%d", arr[i]);
    }
    printf("]");
}

int main() {
    const char* testCases[] = ${JSON.stringify(testCases.map(tc => tc.input))};
    const char* expectedOutputs[] = ${JSON.stringify(testCases.map(tc => tc.expected))};
    int numTests = ${testCases.length};
    
    int passed = 0;
    
    for (int i = 0; i < numTests; i++) {
        try {
            int numsSize, target;
            int* nums = parseInput(testCases[i], &numsSize, &target);
            int returnSize;
            
            int* result = twoSum(nums, numsSize, target, &returnSize);
            
            printf("Test %d: ", i + 1);
            
            // Compare result with expected
            // Simple comparison for [0,1] format
            char expected[100];
            strcpy(expected, expectedOutputs[i]);
            
            if (returnSize == 2) {
                char actual[100];
                sprintf(actual, "[%d,%d]", result[0], result[1]);
                
                if (strcmp(actual, expected) == 0) {
                    printf("PASS\\n");
                    passed++;
                } else {
                    printf("FAIL\\n");
                    printf("  Expected: %s\\n", expected);
                    printf("  Got: %s\\n", actual);
                }
            } else {
                printf("FAIL\\n");
                printf("  Expected: %s\\n", expected);
                printf("  Got: Invalid array size\\n");
            }
            
            free(result);
        } catch (...) {
            printf("Test %d: ERROR\\n", i + 1);
        }
    }
    
    printf("\\nSummary: %d/%d tests passed\\n", passed, numTests);
    if (passed == numTests) {
        printf("All tests passed! 🎉\\n");
    }
    
    return 0;
}
`;
}

// ── Go Wrapper ───────────────────────────────────────────────
function wrapGo(userCode, functionName, testCases) {
  return `
// User's code
${userCode}

package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

func parseInput(input string) ([]int, int, error) {
	// Parse [2,7,11,15], 9 format
	if strings.Contains(input, "[") && strings.Contains(input, "],") {
		parts := strings.Split(input, "],")
		if len(parts) == 2 {
			arrayStr := parts[0] + "]"
			secondStr := strings.TrimSpace(parts[1])
			
			// Parse array
			var nums []int
			if err := json.Unmarshal([]byte(arrayStr), &nums); err != nil {
				// Manual parsing
				arrayStr = strings.Trim(arrayStr, "[]")
				elements := strings.Split(arrayStr, ",")
				for _, elem := range elements {
					num, _ := strconv.Atoi(strings.TrimSpace(elem))
					nums = append(nums, num)
				}
			}
			
			target, _ := strconv.Atoi(secondStr)
			return nums, target, nil
		}
	}
	
	return nil, 0, fmt.Errorf("cannot parse input: %s", input)
}

func arrayToString(arr []int) string {
	result := "["
	for i, v := range arr {
		if i > 0 {
			result += ","
		}
		result += strconv.Itoa(v)
	}
	result += "]"
	return result
}

func main() {
	testCases := []string{${testCases.map(tc => `"${tc.input}"`).join(', ')}}
	expectedOutputs := []string{${testCases.map(tc => `"${tc.expected}"`).join(', ')}}
	
	passed := 0
	
	for i, testCase := range testCases {
		if nums, target, err := parseInput(testCase); err == nil {
			result := twoSum(nums, target)
			output := arrayToString(result)
			expected := expectedOutputs[i]
			
			isPass := output == expected
			if isPass {
				passed++
			}
			
			fmt.Printf("Test %d: %s\\n", i+1, map[bool]string{true: "PASS", false: "FAIL"}[isPass])
			if !isPass {
				fmt.Printf("  Expected: %s\\n", expected)
				fmt.Printf("  Got: %s\\n", output)
			}
		} else {
			fmt.Printf("Test %d: ERROR - %s\\n", i+1, err.Error())
		}
	}
	
	fmt.Printf("\\nSummary: %d/%d tests passed\\n", passed, len(testCases))
	if passed == len(testCases) {
		fmt.Println("All tests passed! 🎉")
	}
}
`;
}

// ── Rust Wrapper ─────────────────────────────────────────────
function wrapRust(userCode, functionName, testCases) {
  return `
// User's code
${userCode}

fn parse_input(input: &str) -> Result<(Vec<i32>, i32), String> {
    // Parse [2,7,11,15], 9 format
    if input.contains('[') && input.contains("],") {
        let parts: Vec<&str> = input.split("],").collect();
        if parts.len() == 2 {
            let array_part = parts[0];
            let second_part = parts[1].trim();
            
            // Parse array
            let array_str = array_part.trim_start_matches('[').trim_end_matches(']');
            let nums: Vec<i32> = array_str
                .split(',')
                .map(|s| s.trim().parse().unwrap_or(0))
                .collect();
            
            let target = second_part.parse().unwrap_or(0);
            return Ok((nums, target));
        }
    }
    
    Err(format!("Cannot parse input: {}", input))
}

fn array_to_string(arr: &[i32]) -> String {
    format!("[{}]", arr.iter()
        .map(|x| x.to_string())
        .collect::<Vec<_>>()
        .join(","))
}

fn main() {
    let test_cases = vec![${testCases.map(tc => `"${tc.input}"`).join(', ')}];
    let expected_outputs = vec![${testCases.map(tc => `"${tc.expected}"`).join(', ')}];
    
    let mut passed = 0;
    
    for (i, test_case) in test_cases.iter().enumerate() {
        match parse_input(test_case) {
            Ok((nums, target)) => {
                let result = two_sum(nums, target);
                let output = array_to_string(&result);
                let expected = &expected_outputs[i];
                
                let is_pass = output == *expected;
                if is_pass {
                    passed += 1;
                }
                
                println!("Test {}: {}", i + 1, if is_pass { "PASS" } else { "FAIL" });
                if !is_pass {
                    println!("  Expected: {}", expected);
                    println!("  Got: {}", output);
                }
            }
            Err(e) => {
                println!("Test {}: ERROR - {}", i + 1, e);
            }
        }
    }
    
    println!("\\nSummary: {}/{} tests passed", passed, test_cases.len());
    if passed == test_cases.len() {
        println!("All tests passed! 🎉");
    }
}
`;
}

export default {
  wrapCodeForTesting
};

type Token = number | "+" | "-" | "*" | "/" | "%" | "(" | ")";
const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2 };
function tokenize(expression: string): Token[] {
  const cleaned = expression.trim().replace(/,/g, "");
  const matches = cleaned.match(/\d+(?:\.\d+)?|[()+*/%-]/g) ?? [];
  if (matches.join("") !== cleaned.replace(/\s/g, "")) throw new Error("Unsupported calculation syntax.");
  const tokens: Token[] = [];
  let previous: Token | undefined;
  for (const match of matches) {
    if (/^\d/.test(match)) tokens.push(Number(match));
    else if (match === "-" && (previous === undefined || previous === "(" || typeof previous === "string" && "+-*/%".includes(previous))) {
      tokens.push(0, "-");
    } else tokens.push(match as Token);
    previous = tokens[tokens.length - 1];
  }
  return tokens;
}
export function calculate(expression: string): number {
  const tokens = tokenize(expression);
  const values: number[] = [], operators: string[] = [];
  const apply = () => {
    const operator = operators.pop();
    const right = values.pop(), left = values.pop();
    if (!operator || left === undefined || right === undefined) throw new Error("Invalid calculation.");
    if (operator === "+") values.push(left + right);
    else if (operator === "-") values.push(left - right);
    else if (operator === "*") values.push(left * right);
    else if (operator === "/") { if (right === 0) throw new Error("Cannot divide by zero."); values.push(left / right); }
    else if (operator === "%") values.push(left % right);
  };
  for (const token of tokens) {
    if (typeof token === "number") values.push(token);
    else if (token === "(") operators.push(token);
    else if (token === ")") { while (operators.length && operators.at(-1) !== "(") apply(); if (operators.pop() !== "(") throw new Error("Mismatched parentheses."); }
    else { while (operators.length && operators.at(-1) !== "(" && precedence[operators.at(-1)!] >= precedence[token]) apply(); operators.push(token); }
  }
  while (operators.length) { if (operators.at(-1) === "(") throw new Error("Mismatched parentheses."); apply(); }
  if (values.length !== 1 || !Number.isFinite(values[0])) throw new Error("Invalid calculation.");
  return values[0];
}
export function calculateFromRequest(message: string): string | null {
  const percent = message.match(/(-?\d+(?:\.\d+)?)\s*%\s*of\s*(-?\d+(?:\.\d+)?)/i);
  if (percent) return String(Number(percent[1]) / 100 * Number(percent[2]));
  const expression = message.match(/(?:calculate|what is|compute)?\s*(-?\d[\d,.]*(?:\s*[()+*/%-]\s*-?\d[\d,.]*)+)\s*\??$/i);
  if (!expression) return null;
  try { return String(calculate(expression[1])); } catch { return null; }
}

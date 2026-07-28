import { MathFormula } from '../types';

export const MATH_FORMULAS: MathFormula[] = [
  // ALGEBRA
  {
    id: 'quad_formula',
    title: 'Quadratic Formula',
    category: 'Algebra',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    description: 'Finds the real or complex roots of a quadratic equation ax² + bx + c = 0.',
    variables: [
      { symbol: 'a', label: 'Coefficient a (x²)', defaultValue: 1 },
      { symbol: 'b', label: 'Coefficient b (x)', defaultValue: -5 },
      { symbol: 'c', label: 'Constant c', defaultValue: 6 },
    ],
    solveFn: (vars) => {
      const { a, b, c } = vars;
      if (a === 0) {
        return { result: NaN, stepLatex: '\\text{Coefficient } a \\text{ cannot be 0 for a quadratic equation.}' };
      }
      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        const x1 = (-b + Math.sqrt(disc)) / (2 * a);
        const x2 = (-b - Math.sqrt(disc)) / (2 * a);
        return {
          result: x1,
          stepLatex: `\\text{Discriminant } \\Delta = (${b})^2 - 4(${a})(${c}) = ${disc} \\\\ x_1 = \\frac{-(${b}) + \\sqrt{${disc}}}{2(${a})} = ${x1.toFixed(4)} \\\\ x_2 = \\frac{-(${b}) - \\sqrt{${disc}}}{2(${a})} = ${x2.toFixed(4)}`,
        };
      } else {
        const real = (-b / (2 * a)).toFixed(4);
        const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
        return {
          result: NaN,
          stepLatex: `\\text{Discriminant } \\Delta = ${disc} < 0 \\quad (\\text{Complex Roots}) \\\\ x_1 = ${real} + ${imag}i \\\\ x_2 = ${real} - ${imag}i`,
        };
      }
    },
  },
  {
    id: 'pythagoras',
    title: 'Pythagorean Theorem',
    category: 'Geometry',
    latex: 'a^2 + b^2 = c^2 \\implies c = \\sqrt{a^2 + b^2}',
    description: 'Calculates the hypotenuse c of a right-angled triangle given legs a and b.',
    diagramType: 'triangle',
    variables: [
      { symbol: 'a', label: 'Leg a', defaultValue: 3 },
      { symbol: 'b', label: 'Leg b', defaultValue: 4 },
    ],
    solveFn: (vars) => {
      const { a, b } = vars;
      const c = Math.sqrt(a * a + b * b);
      return {
        result: c,
        stepLatex: `c = \\sqrt{(${a})^2 + (${b})^2} = \\sqrt{${a * a} + ${b * b}} = \\sqrt{${a * a + b * b}} = ${c.toFixed(4)}`,
        unit: 'units',
      };
    },
  },
  {
    id: 'circle_area',
    title: 'Area of Circle',
    category: 'Geometry',
    latex: 'A = \\pi r^2',
    description: 'Calculates total area enclosed by a circle of radius r.',
    diagramType: 'circle',
    variables: [{ symbol: 'r', label: 'Radius r', defaultValue: 5 }],
    solveFn: (vars) => {
      const { r } = vars;
      const area = Math.PI * r * r;
      return {
        result: area,
        stepLatex: `A = \\pi \\times (${r})^2 = \\pi \\times ${r * r} \\approx ${area.toFixed(4)}`,
        unit: 'sq units',
      };
    },
  },
  {
    id: 'sphere_volume',
    title: 'Volume of Sphere',
    category: 'Geometry',
    latex: 'V = \\frac{4}{3}\\pi r^3',
    description: 'Calculates total 3D volume inside a sphere of radius r.',
    diagramType: 'sphere',
    variables: [{ symbol: 'r', label: 'Radius r', defaultValue: 3 }],
    solveFn: (vars) => {
      const { r } = vars;
      const vol = (4 / 3) * Math.PI * Math.pow(r, 3);
      return {
        result: vol,
        stepLatex: `V = \\frac{4}{3} \\pi (${r})^3 = \\frac{4}{3} \\pi (${Math.pow(r, 3)}) \\approx ${vol.toFixed(4)}`,
        unit: 'cubic units',
      };
    },
  },
  {
    id: 'cylinder_volume',
    title: 'Volume of Cylinder',
    category: 'Geometry',
    latex: 'V = \\pi r^2 h',
    description: 'Calculates volume of a right circular cylinder with radius r and height h.',
    diagramType: 'cylinder',
    variables: [
      { symbol: 'r', label: 'Base Radius r', defaultValue: 4 },
      { symbol: 'h', label: 'Height h', defaultValue: 10 },
    ],
    solveFn: (vars) => {
      const { r, h } = vars;
      const vol = Math.PI * r * r * h;
      return {
        result: vol,
        stepLatex: `V = \\pi \\times (${r})^2 \\times (${h}) = \\pi \\times ${r * r} \\times ${h} \\approx ${vol.toFixed(4)}`,
        unit: 'cubic units',
      };
    },
  },
  // TRIGONOMETRY
  {
    id: 'law_of_cosines',
    title: 'Law of Cosines',
    category: 'Trigonometry',
    latex: 'c^2 = a^2 + b^2 - 2ab \\cos(\\gamma)',
    description: 'Finds side c of any triangle given sides a, b and included angle γ (in degrees).',
    diagramType: 'triangle',
    variables: [
      { symbol: 'a', label: 'Side a', defaultValue: 5 },
      { symbol: 'b', label: 'Side b', defaultValue: 7 },
      { symbol: 'gamma', label: 'Angle γ (deg)', defaultValue: 60 },
    ],
    solveFn: (vars) => {
      const { a, b, gamma } = vars;
      const rad = (gamma * Math.PI) / 180;
      const c2 = a * a + b * b - 2 * a * b * Math.cos(rad);
      const c = Math.sqrt(c2);
      return {
        result: c,
        stepLatex: `c = \\sqrt{(${a})^2 + (${b})^2 - 2(${a})(${b}) \\cos(${gamma}^\\circ)} = \\sqrt{${c2.toFixed(4)}} = ${c.toFixed(4)}`,
        unit: 'units',
      };
    },
  },
  // CALCULUS
  {
    id: 'compound_interest',
    title: 'Compound Interest',
    category: 'Finance',
    latex: 'A = P \\left(1 + \\frac{r}{n}\\right)^{nt}',
    description: 'Calculates future value A of principal P invested at annual rate r compounded n times per year for t years.',
    variables: [
      { symbol: 'P', label: 'Principal P ($)', defaultValue: 1000 },
      { symbol: 'r', label: 'Annual Rate r (dec, e.g. 0.05 for 5%)', defaultValue: 0.05 },
      { symbol: 'n', label: 'Compounding frequency n/yr', defaultValue: 12 },
      { symbol: 't', label: 'Time t (years)', defaultValue: 5 },
    ],
    solveFn: (vars) => {
      const { P, r, n, t } = vars;
      const amount = P * Math.pow(1 + r / n, n * t);
      const interest = amount - P;
      return {
        result: amount,
        stepLatex: `A = ${P} \\left(1 + \\frac{${r}}{${n}}\\right)^{${n} \\times ${t}} = ${P} \\times (${(1 + r / n).toFixed(6)})^{${n * t}} = ${amount.toFixed(2)} \\\\ \\text{Total Interest Earned: } \\$${interest.toFixed(2)}`,
        unit: '$',
      };
    },
  },
  {
    id: 'einstein_energy',
    title: 'Mass-Energy Equivalence',
    category: 'Physics',
    latex: 'E = m c^2',
    description: "Einstein's famous relation where m is mass in kg and c = 3×10⁸ m/s.",
    variables: [{ symbol: 'm', label: 'Mass m (kg)', defaultValue: 1 }],
    solveFn: (vars) => {
      const { m } = vars;
      const c = 299792458;
      const E = m * c * c;
      return {
        result: E,
        stepLatex: `E = (${m}) \\times (299,792,458)^2 = ${E.toExponential(6)} \\text{ Joules}`,
        unit: 'J',
      };
    },
  },
  {
    id: 'normal_distribution',
    title: 'Gaussian Standard Score (Z-Score)',
    category: 'Statistics',
    latex: 'Z = \\frac{x - \\mu}{\\sigma}',
    description: 'Measures how many standard deviations σ a raw score x is from mean μ.',
    variables: [
      { symbol: 'x', label: 'Raw Score x', defaultValue: 85 },
      { symbol: 'mu', label: 'Mean μ', defaultValue: 70 },
      { symbol: 'sigma', label: 'Standard Deviation σ', defaultValue: 10 },
    ],
    solveFn: (vars) => {
      const { x, mu, sigma } = vars;
      if (sigma === 0) return { result: NaN, stepLatex: '\\sigma \\text{ cannot be 0.}' };
      const z = (x - mu) / sigma;
      return {
        result: z,
        stepLatex: `Z = \\frac{${x} - ${mu}}{${sigma}} = \\frac{${x - mu}}{${sigma}} = ${z.toFixed(4)}`,
        unit: 'σ units',
      };
    },
  },
];

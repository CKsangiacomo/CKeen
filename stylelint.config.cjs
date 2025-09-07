module.exports = {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-order", "stylelint-declaration-strict-value"],
  ignoreFiles: ["node_modules/**", "dist/**", "build/**"],
  rules: {
    "no-empty-source": true,
    "block-no-empty": true,
    "declaration-block-no-duplicate-properties": true,
    "order/properties-order": [],
    "scale-unlimited/declaration-strict-value": [
      [
        "color","background","background-color","border","border-color","outline","outline-color","fill","stroke","box-shadow","text-shadow","font-size","line-height","letter-spacing","gap","column-gap","row-gap","margin","margin-top","margin-right","margin-bottom","margin-left","padding","padding-top","padding-right","padding-bottom","padding-left"
      ],
      {
        "ignoreValues": ["inherit","transparent","currentColor","none","0","/^var\\(.+\\)$/"],
        "message": "Use Dieter tokens via var(--...) instead of raw values",
        "disableFix": true
      }
    ],
    "unit-disallowed-list": [["px"], { "severity": "error", "message": "Use rem for sizing in Dieter" }],
    "declaration-property-value-disallowed-list": { "font-family": ["/Roboto/i", "/Ubuntu/i"] },
    "selector-class-pattern": [
      "^(diet|text)(-[a-z0-9]+)*$",
      { "resolveNestedSelectors": true, "message": "CSS class must start with diet- or text-" }
    ]
  },
  overrides: [
    {
      files: ["dieter/tokens/tokens.css"],
      rules: {
        "unit-disallowed-list": null,
        "scale-unlimited/declaration-strict-value": null,
        "selector-class-pattern": null
      }
    },
    {
      files: ["apps/app/public/studio/**/*.css"],
      rules: {
        "selector-class-pattern": [
          "^(?!diet-).*$",
          { "message": "Studio CSS must not target .diet-* classes" }
        ],
        "declaration-property-value-disallowed-list": { "/.*/": [/var\(--role-.*\)/] }
      }
    }
  ]
};




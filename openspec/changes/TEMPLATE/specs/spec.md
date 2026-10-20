# Spec Delta · Change <NNNN>

<!-- 这个变更对主 spec 的修改，用 +/- 表达 diff。 -->
<!-- 路径对应：openspec/specs/<capability>/spec.md -->

## <capability>/spec.md

```diff
### Requirement: <需求名>
- The system SHALL <旧规则>.
+ The system SHALL <新规则>.

#### Scenario: <场景名>
- GIVEN <旧前置>
+ GIVEN <新前置>
  WHEN <动作>
  THEN <预期>
```

## <另一 capability>/spec.md（如涉及多能力）

```diff
### Requirement: <新增需求>
+ The system SHALL <新规则>.
+
+ #### Scenario: <新场景>
+ - GIVEN <前置>
+ - WHEN <动作>
+ - THEN <预期>
```

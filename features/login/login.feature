Feature: Login

  @both @login
  Scenario: Successful login with valid credentials
    Given the app is launched
    When I enter "user@example.com" as email
    And I enter "Password123" as password
    And I tap the login button
    Then I should see "Dashboard"

  @both @login
  Scenario: Failed login with invalid credentials shows error
    Given the app is launched
    When I enter "invalid@example.com" as email
    And I enter "wrongpassword" as password
    And I tap the login button
    Then I should see "Invalid email or password"

  @ios @login @biometrics
  Scenario: iOS Face ID prompt appears on login
    Given the app is launched
    When I tap the login button
    Then I should see "Use Face ID"

  @android @login @biometrics
  Scenario: Android fingerprint prompt appears on login
    Given the app is launched
    When I tap the login button
    Then I should see "Use Fingerprint"

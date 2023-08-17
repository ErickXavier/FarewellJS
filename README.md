# DHTML.js Library

DHTML.js is a robust and comprehensive library designed to simplify web development by providing a declarative and intuitive syntax for common programming patterns. This library encompasses various facets of modern web development, making it a one-stop solution for developers.

1. **Conditionals**: It offers conditional rendering for HTML elements, allowing elements to be shown or hidden based on specific variables.
2. **Loops**: Facilitates the creation of repeated elements from a list of items, streamlining list rendering.
3. **Communication with Restful APIs**: Seamlessly integrates the Fetch API for data communication, including error handling.
4. **Template Support**: Enables code reuse by allowing the definition of reusable HTML templates.
5. **Dynamic CSS Class Assignment**: Dynamically add CSS classes to elements, enhancing styling flexibility.
6. **Switch Case Logic**: Incorporates switch case logic within HTML, adding to the expressiveness of templates.
7. **Call Actions from Other DOM Elements**: Allows actions to be triggered from various DOM elements like links and buttons.
8. **Event Handling**: Simplifies event handling by allowing direct assignment to elements.
9. **Support for Custom Filters and Directives**: Provides an avenue for developers to implement custom filters and directives.
10. **Animations and Transitions**: Supports conditional animations and transitions for a rich user experience.
11. **Form Validation**: Integrates form validation, including support for custom validation rules.
12. **Internationalization and Localization**: Offers translation and formatting based on user location, enhancing global reach.
13. **State Management**: Efficiently manages the application's state, ensuring a smooth user experience.
14. **Web Components Compatibility**: Ensures compatibility with web components, further extending the library's applicability.

With its wide array of features, DHTML.js streamlines development, enabling rapid and efficient creation of interactive and dynamic web applications.

## Table of Contents

1. **Conditionals**
2. **Loops**
3. **Communication with Restful APIs**
4. **Template Support**
5. **Dynamic CSS Class Assignment**
6. **Switch Case Logic**
7. **Call Actions from Other DOM Elements**
8. **Event Handling**
9. **Support for Custom Filters and Directives**
10. **Animations and Transitions**
11. **Form Validation**
12. **Internationalization and Localization**
13. **State Management**
14. **Web Components Compatibility**

## 1. Conditionals

Ability to apply conditional logic within HTML to show or hide elements based on a variable.

Ex.
```
<div [if]="userIsLogged" [then]="show" [else]="#loggedOfUserTemplate">
  User is logged in
</div>
<div [template]="loggedOfUserTemplate">
  User is not logged in
</div>
```

## 2. Loops

Allow the creation of repeated elements based on a list of items.

Ex.
```
<ul>
  <li [foreach]="menuItem" [from]="menuList" [else]="#noItems" [index]="idx">
    <a [href]="menuItem.link">{idx} - {menuItem.label}</a>
  </li>
</ul>
<div [template]="noItems">There are no items</div>
```

## 3. Communication with Restful APIs

Support for sending and receiving data through the Fetch API, with handling for success and error.

Ex.
```
<form [endpoint]="/login" [method]="post" [success]="#postSuccess" [error]="#postError">
  <input type="text" name="user"/>
  <input type="text" name="password"/>
  <button type="submit">Login</button>
</form>
<div [template]="postSuccess" [var]="result">User {result.userName} is logged in</div>
<div [template]="postError" [var]="result">{result.code} {result.message}</div>
```

## 4. Template Support

Facilitate the reuse of HTML code, allowing the use of templates.

Ex.
```
<div [template]="loggedOfUserTemplate">
  User is not logged in
</div>
```

## 5. Dynamic CSS Class Assignment

Allow dynamic addition of CSS classes to elements based on variables.

Ex.
```
<div [class]="userStatusClass">
  User status
</div>
```

## 6. Switch Case Logic

Support for switch case logic within HTML.

Ex.
```
<div [switch]="userRole">
  <div [case]="'admin'">Admin Panel</div>
  <div [case]="'user'">User Dashboard</div>
  <div [default]>Guest</div>
</div>
```

## 7. Call Actions from Other DOM Elements

Ability to call actions from elements such as links, buttons, etc.

Ex.
```
<a [call]="/logout" [success]="#userLoggedOut" [error]="#errorMessage">Logout</a>
```

## 8. Event Handling

Enable the assignment of event handlers directly to elements.

Ex.
```
<button [click]="logoutFunction">Logout</button>
```

## 9. Support for Custom Filters and Directives

Allow developers to create custom filters and directives.

Ex.
```
<div [customDirective]="value">Custom Content</div>
```

## 10. Animations and Transitions

Provide support for conditional CSS animations and transitions.

Ex.
```
<div [animate]="fadeIn" [duration]="2s">Animated Content</div>
```

## 11. Form Validation

Integrate form validation with support for custom rules.

Ex.
```
<input type="text" name="email" [validate]="email" [error]="#emailError"/>
<div [template]="emailError">Invalid Email</div>
```

## 12. Internationalization and Localization

Support for translation and formatting based on user location.

Ex.
```
<div [translate.en-us]="welcomeMessage"></div>
```

## 13. State Management

Provide efficient ways to manage the application's state.

Ex.
```
<div [bind]="userProfile.name"></div>
```

## 14. Web Components Compatibility

Ensure that the library works with web components.

Ex.
```
<custom-component [prop]="value"></custom-component>
```
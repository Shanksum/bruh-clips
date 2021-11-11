// Select the button
const btn = document.getElementById("themeButton");

// Check for dark mode preference at the OS level
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

// Get the user's theme preference from local storage, if it's available
const currentTheme = localStorage.getItem("theme");
// If the user's preference in localStorage is dark...
if (currentTheme == "dark") {
  // Adapt button
  //btn.innerHTML = "<i class='bi bi-lightbulb'></i> Light-Mode";
  btn.innerHTML = "<i class='bi bi-sun-fill' aria-label='Light-Mode'></i>";

  // ...let's toggle the .dark-theme class on the body
  document.body.classList.toggle("dark-mode");
  // Otherwise, if the user's preference in localStorage is light...
} else if (currentTheme == "light") {
  //btn.innerHTML = "<i class='bi bi-lightbulb-off'></i> Dark-Mode";
  btn.innerHTML = "<i class='bi bi-moon-stars-fill' aria-label='Dark-Mode'></i>";

  // ...let's toggle the .light-theme class on the body
  document.body.classList.toggle("light-mode");
}

// Listen for a click on the button 
btn.addEventListener("click", function () {
  // If the user's OS setting is dark and matches our .dark-mode class...
  if (prefersDarkScheme.matches) {
    // ...then toggle the light mode class
    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
      // Change button
      //btn.innerHTML = "<i class='bi bi-lightbulb-off'></i> Dark-Mode";
      btn.innerHTML = "<i class='bi bi-moon-stars-fill' aria-label='Dark-Mode'></i>";

      var theme = "light";
    } else {
      // Change button
      //btn.innerHTML = "<i class='bi bi-lightbulb'></i> Light-Mode";
      btn.innerHTML = "<i class='bi bi-sun-fill' aria-label='Light-Mode'></i>";

      var theme = "dark";
    }

    // ...but use .dark-mode if the .light-mode class is already on the body,
    //var theme = document.body.classList.contains("light-mode") ? "light" : "dark";
  } else {
    // Otherwise, let's do the same thing, but for .dark-mode
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      // Change button
      //btn.innerHTML = "<i class='bi bi-lightbulb'></i> Light-Mode";
      btn.innerHTML = "<i class='bi bi-sun-fill' aria-label='Light-Mode'></i>";

      var theme = "dark";
    } else {
      // Change button
      //btn.innerHTML = "<i class='bi bi-lightbulb-off'></i> Dark-Mode";
      btn.innerHTML = "<i class='bi bi-moon-stars-fill' aria-label='Dark-Mode'></i>";

      var theme = "light";
    }
    //var theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
  }
  // Finally, let's save the current preference to localStorage to keep using it
  localStorage.setItem("theme", theme);
});
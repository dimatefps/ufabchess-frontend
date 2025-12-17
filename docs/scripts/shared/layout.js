async function loadComponent(id, file) {
  const response = await fetch(file);
  const html = await response.text();
  document.getElementById(id).innerHTML = html;
}

loadComponent("site-header", "/components/header.html");
loadComponent("site-footer", "/components/footer.html");

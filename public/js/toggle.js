var collapse = document.getElementById("collapse");
var content = document.getElementById("content");

collapse.onclick = function () {
  content.classList.toggle('hide')
  collapse.classList.toggle('active')
}
// DOM elements
const input = document.getElementById("main-input");
const mainWrapper = document.getElementById("main-wrapper")
const searchButton = document.getElementById("search-button");
const successArea = document.getElementById("success-area")
const mainKeyWrapper = document.querySelector(".main-key-wrapper")
const shadow = document.querySelector(".main-key-wrapper_shadow")

// utils function
function copyToNote(text) {
  const tempInput = document.createElement("input");
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
}
function truncateAddress (address) {
  return `${address.substr(0, 5)}...${address.substr(
      address.length - 5,
      address.length
  )}`;
}

/* Dan */
//------------------

fetch("whitelist.json")
  .then(response => response.json())
  .then(usersData => {
    // whitelist data
    const whitelist = usersData
    const whiteListLeaves = whitelist.map(addr => keccak256(addr))
    const tree = new window.MerkleTree(whiteListLeaves, keccak256, {sortPairs: true})
    const rootHash = tree.getRoot()
    const claimingAddress = whiteListLeaves[5]; //Minting address

    // event listener for search and input
    searchButton.addEventListener("click", () => {
      searchKeyFromAddress(input.value)
    });
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
          event.preventDefault();
          searchKeyFromAddress(input.value);
      }
    });
    
    function searchKeyFromAddress (address) {
      // key variables
      const leaf = keccak256(address)
      const proof = tree.getHexProof(leaf)
      const temp = JSON.stringify(proof).replace(/"/g, '').replace(/\s+/g, '');
      const isValid = tree.verify(proof, leaf, rootHash)
      // style variables
      const wrapperWidth = (mainKeyWrapper.offsetWidth + "px").toString()
      const wrapperHeight = (mainKeyWrapper.offsetHeight + "px").toString()
      let screenWidth = screen.width
      let isMobile = screenWidth < 768
      const ANIMATION_TIME = 500
      // starting style
      mainWrapper.classList.add("start")
      shadow.style.zIndex = "2";
      // if wallet is in the whitelist
      if (isValid) {
        // starting style for success
        mainWrapper.classList.remove("start")
        mainWrapper.classList.remove("error")
        mainWrapper.classList.remove("success")
        mainKeyWrapper.style.minHeight = wrapperHeight
        mainKeyWrapper.style.minWidth = wrapperWidth
        shadow.classList.add("active")
        setTimeout(() => {
          // changing style to key wrapper
          mainKeyWrapper.innerHTML = ""
          if (isMobile) {
            mainKeyWrapper.style.minWidth = "305px"
          } else {
            mainKeyWrapper.style.minWidth = "650px"
          }
          mainKeyWrapper.classList.remove("error")
          mainKeyWrapper.classList.add("success")

          setTimeout(() => {
            mainWrapper.classList.add("success")
            successArea.innerHTML = "Congratulations, you're in WL!"
            // area for the key
            const keyArea = document.createElement("span")
            keyArea.style.color = "white"

            // copy button setup
            const copyButton = document.createElement("button");
            copyButton.classList.add("copy-button");
            copyButton.innerHTML = "<img src='img/copy-icon.svg' alt='Copy' />";
            const copyHover = document.createElement("div");
            copyHover.classList.add("copy-hover");
            copyHover.innerText = "Copy to clipboard";
            copyButton.appendChild(copyHover)
            copyButton.addEventListener("click", () => {
              const textToCopy = temp;
              copyToNote(textToCopy);
              copyHover.innerText = "Copied!"
              setTimeout(() => {
                copyHover.innerText = "Copy to clipboard";
              }, 1500);
            });

            mainKeyWrapper.innerHTML = "<img src='img/key-icon.svg' alt='Copy' />:"
            keyArea.append(truncateAddress(temp)) // append result  
            mainKeyWrapper.append(keyArea)
            mainKeyWrapper.appendChild(copyButton);
            // remove the shadow from key 
            shadow.classList.remove("active")
            setTimeout(() => {
              shadow.style.zIndex = "-2";
            },400)   
          }, ANIMATION_TIME);
        }, 400)
      // if the wallet is not in the whitelist
      } else {
        // starting style for error
        successArea.innerHTML = ""
        mainWrapper.classList.remove("start")
        mainWrapper.classList.remove("success")
        mainKeyWrapper.style.minWidth = wrapperWidth
        mainKeyWrapper.style.minHeight = wrapperHeight
        shadow.classList.add("active")
        setTimeout(() => {
          // define area width if mobile and change style
          if (!isMobile) {
            mainKeyWrapper.style.minWidth = "425px"
          } else {
            mainKeyWrapper.style.minWidth = "300px"
          }
          mainKeyWrapper.textContent = ""
          mainKeyWrapper.classList.remove("success")
          mainKeyWrapper.classList.add("error")
          setTimeout(() => {
            mainWrapper.classList.add("error")
            mainKeyWrapper.textContent = "Sorry, your wallet is not in our whitelist"
            // remove shadow for area
            shadow.classList.remove("active")
            setTimeout(() => {
              shadow.style.zIndex = "-2";
            },400)
          },ANIMATION_TIME)
        },400)
      }
      // empty the input
      input.value = "";
    };
  })
  .catch(error => console.error(error));

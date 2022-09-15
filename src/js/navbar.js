// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Nav Bar
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

// Navbar
const navbarContainer = document.querySelector("#navbarNav");
let navbarNavLinks;
let activeNavbarNavLink;

// NavbarLink - Link Object with Name and Href properties
const NavbarLink = (name, href) => {
    return {name, href}
}

// getNavbarLinks() - Gets Navbar Links to be initiallized
const getNavbarLinks = () => {
    let navbarLinks = [];
    navbarLinks.push(NavbarLink("Home", "#hero"));
    navbarLinks.push(NavbarLink("Calculator", "#exchange-cta"));
    navbarLinks.push(NavbarLink("QuickLook", "#curr-pair-info"));
    navbarLinks.push(NavbarLink("Metals", "#precious-metals"));
    navbarLinks.push(NavbarLink("Contact", "#contact"));
    return navbarLinks;
}

// navbarEventsOnClick() - Collapses Hamburger Menu on Click
const navbarEventsOnClick = () => {
    navbarContainer.addEventListener("click", () => {
        if (window.innerWidth < 768) {
            navbarContainer.classList.remove("show");
        }
    });

    Array.from(navbarNavLinks).map((navLink) => {
        navLink.addEventListener("click", (event) => {
            activeNavbarNavLink.classList.remove("active");
            activeNavbarNavLink = event.target;
            activeNavbarNavLink.classList.add("active");
        });
    });

    window.addEventListener("scroll", () => {
        if (window.innerWidth < 768) {
            navbarContainer.classList.remove("show");
        }
    });
}

// navbarEventsOnScroll() - Navbar Active State implementation on Scroll
const navbarEventsOnScroll = () => {
    const targets = document.querySelectorAll(".page-section");

    let options = {
        threshold: [0.5],
    };

    function handleIntersection(entries) {
        entries.map((entry) => {
            if (entry.isIntersecting) {
                // console.log(entry.target.id + "is now visible");
                activeNavbarNavLink.classList.remove("active");
                activeNavbarNavLink = document.querySelector(
                    `a[href="#${entry.target.id}"]`
                );
                activeNavbarNavLink.classList.add("active");
            }
        });
    }

    const observer = new IntersectionObserver(handleIntersection, options);

    targets.forEach((target) => {
        observer.observe(target);
    });
}

// getNavbarNavLinkElement(navbarLink) - Gets List Element with Link
const getNavbarNavLinkElement = (navbarLink) => {
    let listEle = document.createElement("li");
    let linkEle = document.createElement("a");

    // Make link element
    linkEle.classList.add("nav-link");
    linkEle.setAttribute("href", navbarLink.href);
    linkEle.textContent = navbarLink.name;

    // Make list element
    listEle.classList.add("nav-item");
    listEle.appendChild(linkEle);

    return listEle;
}

// createNavLinksUnorderedList() - Create unordered list of Nav Links
const createNavLinksUnorderedList = () => {
    let navbarUnOrderedList = document.createElement("ul");
    navbarUnOrderedList.classList.add("navbar-nav", "ms-auto");

    let pageSections = getNavbarLinks();

    // Add list elements with link
    for (let section of pageSections) {
        navbarUnOrderedList.appendChild(getNavbarNavLinkElement(section));
    }

    // Add it to the container on page
    navbarContainer.appendChild(navbarUnOrderedList);

    // Initialize Active Link
    navbarNavLinks = document.querySelectorAll(".navbar-collapse.collapse a");
    activeNavbarNavLink = navbarNavLinks[0];
    activeNavbarNavLink.classList.add("active");
}

// initializeNavbar() - Initializes Navbar
const initializeNavbar = () => {
    createNavLinksUnorderedList();
    navbarEventsOnClick();
    navbarEventsOnScroll(); //Uses Intersection Observer API
}

export default initializeNavbar;
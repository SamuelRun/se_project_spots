import "./index.css";
import {
  enableValidation,
  resetValidation,
  settings,
  disableButton,
} from "../scripts/validation.js";
import logoSrc from "../images/logo.svg";
import avatarSrc from "../images/avatar.jpg";
import plusSrc from "../images/plus.svg";
import pencilSrc from "../images/pencil.svg";
import Api from "../utils/Api.js";
import { setButtontext } from "../utils/helpers.js";

const spotsLogo = document.getElementById("spots-logo");
spotsLogo.src = logoSrc;

const bessieAvatar = document.getElementById("bessie-avatar");
bessieAvatar.src = avatarSrc;

const plusIcon = document.getElementById("plus");
plusIcon.src = plusSrc;

const pencilIcon = document.getElementById("pencil");
pencilIcon.src = pencilSrc;

const initialCards = [
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Golden Gate bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },
];

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "d6d2ffad-0102-4fd6-a8da-1ce6ae2b6687",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, user]) => {
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.prepend(cardElement);
    });

    profileAvatar.src = user.avatar;
    profileName.textContent = user.name;
    profileDescription.textContent = user.about;
  })
  .catch(console.error);

const modals = document.querySelectorAll(".modal");

// Profile elements
const profileAvatar = document.querySelector(".profile__avatar");
const editModalBtn = document.querySelector(".profile__edit-btn");
const cardModalBtn = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");

// delete elements

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn");
const deleteModalCancelBtn = deleteModal.querySelector(".modal__cancel-btn");

// avatar elements

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

// Form elements
const editModal = document.querySelector("#edit-modal");
const profileForm = document.forms["edit-profile"];
const cardForm = document.forms["edit-card"];
const editFormElement = editModal.querySelector(".modal__form");
const inputElement = editModal.querySelector(".modal__input");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const cardModal = document.querySelector("#add-card-modal");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardNameInput = cardModal.querySelector("#card-name-input");
const cardLinkInput = cardModal.querySelector("#card-link-input");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);

// Card elements
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

function handleLike(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-btn_liked");
  api
    .changeLikeStatus(id, isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-btn_liked");
    })
    .catch(console.error);
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  } else {
    cardLikeBtn.classList.remove("card__like-btn_liked");
  }

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardLikeBtn.addEventListener("click", (evt) => {
    handleLike(evt, data._id);
  });

  cardDeleteBtn.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  return cardElement;
}

function openModal(modals) {
  modals.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modals) {
  modals.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscape);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtontext(submitBtn, true);

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtontext(submitBtn, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtontext(submitBtn, true);

  api
    .addCard({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    })
    .then((item) => {
      const cardElement = getCardElement(item);
      cardsList.prepend(cardElement);
      cardForm.reset();
      disableButton(cardSubmitBtn, settings);
      closeModal(cardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtontext(submitBtn, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtontext(submitBtn, true);

  api
    .editAvatarUserInfo({
      avatar: avatarInput.value,
    })
    .then((data) => {
      avatarSrc = data.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtontext(submitBtn, false);
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtontext(submitBtn, true, "Deleting...", "Delete");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtontext(submitBtn, false, "Deleting...", "Delete");
    });
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

editModalBtn.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  openModal(editModal);
  resetValidation(
    profileForm,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
});

editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

cardModalBtn.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

deleteModalCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteModalCancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

profileForm.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const modal_opened = document.querySelector(".modal_opened");
    closeModal(modal_opened);
  }
}

modals.forEach((modals) => {
  modals.addEventListener("click", (evt) => {
    if (evt.target == modals) {
      closeModal(modals);
    }
  });
});

enableValidation(settings);

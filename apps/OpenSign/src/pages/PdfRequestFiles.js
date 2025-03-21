import React, { useState, useRef, useEffect } from "react";
import { isEnableSubscription, isStaging, themeColor } from "../constant/const";
import { PDFDocument } from "pdf-lib";
import "../styles/signature.css";
import Parse from "parse";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SignPad from "../components/pdf/SignPad";
import RenderAllPdfPage from "../components/pdf/RenderAllPdfPage";
import Tour from "reactour";
import Confetti from "react-confetti";
import moment from "moment";
import {
  contractDocument,
  multiSignEmbed,
  embedDocId,
  pdfNewWidthFun,
  signPdfFun,
  onImageSelect,
  onSaveSign,
  onSaveImage,
  addDefaultSignatureImg,
  radioButtonWidget,
  replaceMailVaribles,
  fetchSubscription,
  convertPdfArrayBuffer,
  contractUsers,
  handleSendOTP,
  contactBook,
  handleDownloadPdf,
  handleToPrint,
  handleDownloadCertificate
} from "../constant/Utils";
import LoaderWithMsg from "../primitives/LoaderWithMsg";
import HandleError from "../primitives/HandleError";
import Header from "../components/pdf/PdfHeader";
import RenderPdf from "../components/pdf/RenderPdf";
import PdfDeclineModal from "../primitives/PdfDeclineModal";
import Title from "../components/Title";
import DefaultSignature from "../components/pdf/DefaultSignature";
import ModalUi from "../primitives/ModalUi";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import Loader from "../primitives/Loader";
import { useSelector } from "react-redux";
import SignerListComponent from "../components/pdf/SignerListComponent";
import VerifyEmail from "../components/pdf/VerifyEmail";
import PdfZoom from "../components/pdf/PdfZoom";

function PdfRequestFiles(props) {
  const [pdfDetails, setPdfDetails] = useState([]);
  const [signedSigners, setSignedSigners] = useState([]);
  const [unsignedSigners, setUnSignedSigners] = useState([]);
  const [isSignPad, setIsSignPad] = useState(false);
  const [pdfUrl, setPdfUrl] = useState();
  const [allPages, setAllPages] = useState(null);
  const numPages = 1;
  const [pageNumber, setPageNumber] = useState(1);
  const [image, setImage] = useState(null);
  const [isImageSelect, setIsImageSelect] = useState(false);
  const [signature, setSignature] = useState();
  const [isStamp, setIsStamp] = useState(false);
  const [signKey, setSignKey] = useState();
  const [imgWH, setImgWH] = useState({});
  const imageRef = useRef(null);
  const [handleError, setHandleError] = useState();
  const [selectWidgetId, setSelectWidgetId] = useState("");
  const [otpLoader, setOtpLoader] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [requestSignTour, setRequestSignTour] = useState(false);
  const [tourStatus, setTourStatus] = useState([]);
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: "This might take some time"
  });
  const [defaultSignImg, setDefaultSignImg] = useState();
  const [isDocId, setIsDocId] = useState(false);
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [pdfOriginalWH, setPdfOriginalWH] = useState([]);
  const [signerPos, setSignerPos] = useState([]);
  const [signerObjectId, setSignerObjectId] = useState();
  const [isUiLoading, setIsUiLoading] = useState(false);
  const [isDecline, setIsDecline] = useState({ isDeclined: false });
  const [currentSigner, setCurrentSigner] = useState(false);
  const [isAlert, setIsAlert] = useState({ isShow: false, alertMessage: "" });
  const [unSignedWidgetId, setUnSignedWidgetId] = useState("");
  const [expiredDate, setExpiredDate] = useState("");
  const [isResize, setIsResize] = useState(false);
  const [signerUserId, setSignerUserId] = useState();
  const [isDontShow, setIsDontShow] = useState(false);
  const [isDownloading, setIsDownloading] = useState("");
  const [defaultSignAlert, setDefaultSignAlert] = useState({
    isShow: false,
    alertMessage: ""
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCompleted, setIsCompleted] = useState({
    isCertificate: false,
    isModal: false
  });
  const [myInitial, setMyInitial] = useState("");
  const [isInitial, setIsInitial] = useState(false);
  const [pdfLoad, setPdfLoad] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [alreadySign, setAlreadySign] = useState(false);
  const [containerWH, setContainerWH] = useState({});
  const [validateAlert, setValidateAlert] = useState(false);
  const [widgetsTour, setWidgetsTour] = useState(false);
  const [minRequiredCount, setminRequiredCount] = useState();
  const [sendInOrder, setSendInOrder] = useState(false);
  const [currWidgetsDetails, setCurrWidgetsDetails] = useState({});
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [extUserId, setExtUserId] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isVerifyModal, setIsVerifyModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [contractName, setContractName] = useState("");
  const [zoomPercent, setZoomPercent] = useState(0);
  const [totalZoomPercent, setTotalZoomPercent] = useState();
  const [scale, setScale] = useState(1);
  const [uniqueId, setUniqueId] = useState("");
  const [isPublicTemplate, setIsPublicTemplate] = useState(false);
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [isOtp, setIsOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState({});
  const [documentId, setDocumentId] = useState("");
  const [isPublicContact, setIsPublicContact] = useState(false);
  const isHeader = useSelector((state) => state.showHeader);
  const divRef = useRef(null);

  const isMobile = window.innerWidth < 767;

  let isGuestSignFlow = false;
  let sendmail;
  let getDocId = "";
  const route = !props.templateId && window.location.pathname;
  const getQuery =
    !props.templateId &&
    window.location?.search &&
    window.location?.search?.split("?");

  if (getQuery) {
    sendmail = getQuery[1].split("=")[1];
  }
  const checkSplit = route && route?.split("/");

  if (checkSplit && checkSplit.length > 4) {
    isGuestSignFlow = true;
    getDocId = checkSplit[3];
  } else {
    getDocId = checkSplit[2];
  }
  let getDocumentId = getDocId || documentId;
  useEffect(() => {
    if (getDocumentId) {
      setDocumentId(getDocumentId);
      getDocumentDetails(getDocumentId);
    } else if (props.templateId) {
      getTemplateDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.templateId, getDocumentId]);
  useEffect(() => {
    const updateSize = () => {
      if (divRef.current) {
        const pdfWidth = pdfNewWidthFun(divRef);
        setPdfNewWidth(pdfWidth);
        setContainerWH({
          width: divRef.current.offsetWidth,
          height: divRef.current.offsetHeight
        });
      }
    };

    // Use setTimeout to wait for the transition to complete
    const timer = setTimeout(updateSize, 100); // match the transition duration
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divRef.current, isHeader]);
  //function to use resend otp for email verification
  const handleResend = async (e) => {
    e.preventDefault();
    setOtpLoader(true);
    const localuser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const currentUser = JSON.parse(localuser);
    await handleSendOTP(currentUser?.email);
    setOtpLoader(false);
    alert("OTP sent on you email");
  };
  //`handleVerifyEmail` function is used to verify email with otp
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setOtpLoader(true);
    const localuser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const currentUser = JSON.parse(localuser);
    try {
      const resEmail = await Parse.Cloud.run("verifyemail", {
        otp: otp,
        email: currentUser?.email
      });
      if (resEmail?.message === "Email is verified.") {
        setIsEmailVerified(true);
      } else if (resEmail?.message === "Email is already verified.") {
        setIsEmailVerified(true);
      }
      setOtp("");
      alert(resEmail.message);
      setIsVerifyModal(false);
      //handleRecipientSign();
    } catch (error) {
      alert(error.message);
    } finally {
      setOtpLoader(false);
    }
  };
  //`handleVerifyBtn` function is used to send otp on user mail
  const handleVerifyBtn = async () => {
    setIsVerifyModal(true);
    const localuser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const currentUser = JSON.parse(localuser);
    await handleSendOTP(currentUser?.email);
  };
  async function checkIsSubscribed(extUserId, contactId) {
    const isGuestSign = isGuestSignFlow || false;
    const res = await fetchSubscription(extUserId, contactId, isGuestSign);
    const plan = res.plan;
    const billingDate = res?.billingDate;
    const status = res?.status;
    if (plan === "freeplan") {
      return true;
    } else if (billingDate) {
      if (new Date(billingDate) > new Date()) {
        setIsSubscribed(true);
        return true;
      } else {
        if (isGuestSign) {
          setIsSubscriptionExpired(true);
        } else {
          window.location.href = "/subscription";
        }
      }
    } else if (isGuestSign) {
      if (status) {
        setIsSubscribed(true);
        return true;
      } else {
        setIsSubscriptionExpired(true);
      }
    } else {
      if (isGuestSign) {
        setIsSubscriptionExpired(true);
      } else {
        window.location.href = "/subscription";
      }
    }
  }
  //function for get document details for perticular signer with signer'object id
  const getTemplateDetails = async () => {
    try {
      const params = { templateId: props.templateId, ispublic: true };
      const templateDeatils = await axios.post(
        `${localStorage.getItem("baseUrl")}functions/getTemplate`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            sessiontoken: localStorage.getItem("accesstoken")
          }
        }
      );
      const documentData =
        templateDeatils.data && templateDeatils.data.result
          ? [templateDeatils.data.result]
          : [];

      if (documentData && documentData.length > 0) {
        setIsPublicTemplate(true);
        const getPublicRole = documentData[0]?.PublicRole[0];
        const getUniqueIdDetails = documentData[0]?.Placeholders.find(
          (x) => x.Role === getPublicRole
        );
        if (getUniqueIdDetails) {
          setUniqueId(getUniqueIdDetails.Id);
        }
        setSignerPos(documentData[0]?.Placeholders);
        let placeholdersOrSigners = [];
        // const placeholder = documentData[0]?.Placeholders;
        for (const placeholder of documentData[0].Placeholders) {
          //`emailExist` variable to handle condition for quick send flow and show unsigned signers list
          const signerIdExist = placeholder?.signerObjId;
          if (signerIdExist) {
            const getSignerData = documentData[0].Signers.find(
              (data) => data.objectId === placeholder?.signerObjId
            );
            placeholdersOrSigners.push(getSignerData);
          } else {
            placeholdersOrSigners.push(placeholder);
          }
        }
        setUnSignedSigners(placeholdersOrSigners);
        setPdfDetails(documentData);
        setIsLoading({
          isLoad: false
        });
      } else if (
        documentData === "Error: Something went wrong!" ||
        (documentData.result && documentData.result.error)
      ) {
        console.log("err in get template details ");
        setHandleError("Error: Something went wrong!");
        setIsLoading({
          isLoad: false
        });
      } else {
        setHandleError("No Data Found!");
        setIsLoading({
          isLoad: false
        });
      }
    } catch (err) {
      console.log("err in get template details ", err);
      if (err?.response?.data?.code === 101) {
        setHandleError("Error: Template not found!");
      } else {
        setHandleError("Error: Something went wrong!");
      }
    }
  };
  //function for get document details for perticular signer with signer'object id
  const getDocumentDetails = async (docId, isNextUser) => {
    const senderUser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const jsonSender = JSON.parse(senderUser);
    let currUserId;
    //getting document details
    const documentData = await contractDocument(documentId || docId);
    if (documentData && documentData.length > 0) {
      setExtUserId(documentData[0]?.ExtUserPtr?.objectId);
      const isCompleted =
        documentData[0].IsCompleted && documentData[0].IsCompleted;
      const expireDate = documentData[0].ExpiryDate.iso;
      const declined = documentData[0].IsDeclined && documentData[0].IsDeclined;
      const expireUpdateDate = new Date(expireDate).getTime();
      const currDate = new Date().getTime();
      const getSigners = documentData[0].Signers;
      const getCurrentSigner =
        getSigners &&
        getSigners.filter(
          (data) => data.UserId.objectId === jsonSender?.objectId
        );

      currUserId = getCurrentSigner[0] ? getCurrentSigner[0].objectId : "";
      if (isEnableSubscription) {
        await checkIsSubscribed(
          documentData[0]?.ExtUserPtr?.objectId,
          currUserId
        );
      }
      if (currUserId) {
        setSignerObjectId(currUserId);
      }
      if (documentData[0].SignedUrl) {
        setPdfUrl(documentData[0].SignedUrl);
      } else {
        setPdfUrl(documentData[0].URL);
      }
      if (isCompleted) {
        setIsSigned(true);
        const data = {
          isCertificate: true,
          isModal: true
        };
        setAlreadySign(true);
        setIsCompleted(data);
        setIsCelebration(true);
        setTimeout(() => {
          setIsCelebration(false);
        }, 5000);
      } else if (declined) {
        const currentDecline = {
          currnt: "another",
          isDeclined: true
        };
        setIsDecline(currentDecline);
      } else if (currDate > expireUpdateDate) {
        const expireDateFormat = moment(new Date(expireDate)).format(
          "MMM DD, YYYY"
        );
        setIsExpired(true);
        setExpiredDate(expireDateFormat);
      } // Check if the current signer is not a last signer and handle the complete message.
      else if (isNextUser) {
        setIsCelebration(true);
        setTimeout(() => {
          setIsCelebration(false);
        }, 5000);
        setIsCompleted({
          isModal: true,
          message:
            "You have successfully signed the document. You can download or print a copy of the partially signed document. A copy of the digitally signed document will be sent to the owner over email once it is signed by all signers."
        });
      } else {
        if (currUserId) {
          const checkCurrentUser = documentData[0].Placeholders.find(
            (data) => data?.signerObjId === currUserId
          );
          if (checkCurrentUser) {
            setCurrentSigner(true);
          }
        }
      }
      const audittrailData =
        documentData[0].AuditTrail &&
        documentData[0].AuditTrail.length > 0 &&
        documentData[0].AuditTrail.filter((data) => data.Activity === "Signed");

      const checkAlreadySign =
        documentData[0].AuditTrail &&
        documentData[0].AuditTrail.length > 0 &&
        documentData[0].AuditTrail.filter(
          (data) =>
            data.UserPtr.objectId === currUserId && data.Activity === "Signed"
        );
      if (
        checkAlreadySign &&
        checkAlreadySign[0] &&
        checkAlreadySign.length > 0
      ) {
        setAlreadySign(true);
      } else {
        const obj = documentData?.[0];
        setSendInOrder(obj?.SendinOrder || false);
        if (
          obj &&
          obj.Signers &&
          obj.Signers.length > 0 &&
          obj.Placeholders &&
          obj.Placeholders.length > 0
        ) {
          const params = {
            event: "viewed",
            contactId: currUserId,
            body: {
              objectId: documentData?.[0].objectId,
              file: documentData?.[0]?.SignedUrl || documentData?.[0]?.URL,
              name: documentData?.[0].Name,
              note: documentData?.[0].Note || "",
              description: documentData?.[0].Description || "",
              signers: documentData?.[0].Signers?.map((x) => ({
                name: x?.Name,
                email: x?.Email,
                phone: x?.Phone
              })),
              viewedBy: jsonSender.email,
              viewedAt: new Date(),
              createdAt: documentData?.[0].createdAt
            }
          };

          try {
            await axios.post(
              `${localStorage.getItem("baseUrl")}functions/callwebhook`,
              params,
              {
                headers: {
                  "Content-Type": "application/json",
                  "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
                  sessiontoken: localStorage.getItem("accesstoken")
                }
              }
            );
          } catch (err) {
            console.log("Err ", err);
          }
        }
      }

      let signers = [];
      let unSignedSigner = [];

      const placeholdersOrSigners = [];
      for (const placeholder of documentData[0].Placeholders) {
        //`emailExist` variable to handle condition for quick send flow and show unsigned signers list
        const signerIdExist = placeholder?.signerObjId;
        if (signerIdExist) {
          const getSignerData = documentData[0].Signers.find(
            (data) => data.objectId === placeholder?.signerObjId
          );
          placeholdersOrSigners.push(getSignerData);
        } else {
          placeholdersOrSigners.push(placeholder);
        }
      }
      //condition to check already signed document by someone
      if (audittrailData && audittrailData.length > 0) {
        setIsDocId(true);

        for (const item of placeholdersOrSigners) {
          const checkEmail = item?.email;
          //if email exist then compare user signed by using email else signers objectId
          const emailOrId = checkEmail ? item.email : item.objectId;
          //`isSignedSignature` variable to handle break loop whenever it get true
          let isSignedSignature = false;
          //checking the signer who signed the document by using audit trail details.
          //and save signedSigners and unsignedSigners details
          for (const doc of audittrailData) {
            const signedExist = checkEmail
              ? doc?.UserPtr.Email
              : doc?.UserPtr.objectId;

            if (emailOrId === signedExist) {
              signers.push({ ...item });
              isSignedSignature = true;
              break;
            }
          }
          if (!isSignedSignature) {
            unSignedSigner.push({ ...item });
          }
        }
        setSignedSigners(signers);
        setUnSignedSigners(unSignedSigner);
        setSignerPos(documentData[0].Placeholders);
      } else {
        //else condition is show there are no details in audit trail then direct push all signers details
        //in unsignedsigners array
        setUnSignedSigners(placeholdersOrSigners);
        setSignerPos(documentData[0].Placeholders);
      }
      setPdfDetails(documentData);
      //checking if condition current user already sign or owner does not exist as a signer or document has been declined by someone or document has been expired
      //then stop to display tour message
      if (
        (checkAlreadySign &&
          checkAlreadySign[0] &&
          checkAlreadySign.length > 0) ||
        !currUserId ||
        declined ||
        currDate > expireUpdateDate
      ) {
        setRequestSignTour(true);
      } else {
        //else condition to check current user exist in contracts_Users class and check tour message status
        //if not then check user exist in contracts_Contactbook class and check tour message status
        const localuser = localStorage.getItem(
          `Parse/${localStorage.getItem("parseAppId")}/currentUser`
        );
        const currentUser = JSON.parse(localuser);
        const currentUserEmail = currentUser.email;
        const res = await contractUsers(currentUserEmail);
        if (res === "Error: Something went wrong!") {
          setHandleError("Error: Something went wrong!");
        } else if (res[0] && res?.length) {
          setContractName("_Users");
          currUserId = res[0].objectId;
          setSignerUserId(currUserId);
          const tourData = res[0].TourStatus && res[0].TourStatus;
          if (tourData && tourData.length > 0) {
            const checkTourRequest = tourData.filter(
              (data) => data?.requestSign
            );
            setTourStatus(tourData);
            setRequestSignTour(checkTourRequest[0]?.requestSign || false);
          }
        } else if (res?.length === 0) {
          const res = await contactBook(currUserId);
          if (res === "Error: Something went wrong!") {
            setHandleError("Error: Something went wrong!");
          } else if (res[0] && res.length) {
            setContractName("_Contactbook");
            const objectId = res[0].objectId;
            setSignerUserId(objectId);
            const tourData = res[0].TourStatus && res[0].TourStatus;
            if (tourData && tourData.length > 0) {
              const checkTourRequest = tourData.filter(
                (data) => data?.requestSign
              );
              setTourStatus(tourData);
              setRequestSignTour(checkTourRequest[0]?.requestSign || false);
            }
          } else if (res.length === 0) {
            setHandleError("Error: User does not exist!");
          }
        }
      }
      setIsUiLoading(false);
    } else if (
      documentData === "Error: Something went wrong!" ||
      (documentData.result && documentData.result.error)
    ) {
      setHandleError("Error: Something went wrong!");
      setIsLoading({
        isLoad: false
      });
      console.log("err in  getDocument cloud function ");
    } else {
      setHandleError("No Data Found!");
      setIsUiLoading({
        isLoad: false
      });
    }
    await axios
      .get(
        `${localStorage.getItem(
          "baseUrl"
        )}classes/contracts_Signature?where={"UserId": {"__type": "Pointer","className": "_User", "objectId":"${
          jsonSender?.objectId
        }"}}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      )
      .then((Listdata) => {
        const json = Listdata.data;
        const res = json.results;

        if (res[0] && res.length > 0) {
          setDefaultSignImg(res[0].ImageURL);
          setMyInitial(res[0]?.Initials);
        }

        const loadObj = {
          isLoad: false
        };
        setIsLoading(loadObj);
      })
      .catch((err) => {
        console.log("Err in contracts_Signature class", err);
        setHandleError("Error: Something went wrong!");
        setIsLoading({
          isLoad: false
        });
      });
  };
  //function for embed signature or image url in pdf
  async function embedWidgetsData() {
    //for emailVerified data checking first in localstorage
    const localuser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    let currentUser = JSON.parse(localuser);
    //if emailVerified data is not present in local user details then fetch again in _user class
    if (!currentUser?.emailVerified) {
      const userQuery = new Parse.Query(Parse.User);
      const getUser = await userQuery.get(currentUser?.objectId, {
        sessionToken: currentUser?.sessionToken
      });
      if (getUser) {
        currentUser = JSON.parse(JSON.stringify(getUser));
      }
    }
    let isEmailVerified = currentUser?.emailVerified;
    //check if isEmailVerified then go on next step
    if (isEmailVerified) {
      setIsEmailVerified(isEmailVerified);
      try {
        const checkUser = signerPos.filter(
          (data) => data.signerObjId === signerObjectId
        );
        if (checkUser && checkUser.length > 0) {
          let checkboxExist,
            requiredRadio,
            showAlert = false,
            widgetKey,
            radioExist,
            requiredCheckbox,
            pageNumber; // `pageNumber` is used to check on which page user did not fill widget's data then change current pageNumber and show tour message on that page

          for (let i = 0; i < checkUser[0].placeHolder.length; i++) {
            for (let j = 0; j < checkUser[0].placeHolder[i].pos.length; j++) {
              //get current page
              const updatePage = checkUser[0].placeHolder[i]?.pageNumber;
              //checking checbox type widget
              checkboxExist =
                checkUser[0].placeHolder[i].pos[j].type === "checkbox";
              //checking radio button type widget
              radioExist =
                checkUser[0].placeHolder[i].pos[j].type === radioButtonWidget;
              //condition to check checkbox widget exist or not
              if (checkboxExist) {
                //get all required type checkbox
                requiredCheckbox = checkUser[0].placeHolder[i].pos.filter(
                  (position) =>
                    !position.options?.isReadOnly &&
                    position.type === "checkbox"
                );
                //if required type checkbox data exit then check user checked all checkbox or some checkbox remain to check
                //also validate to minimum and maximum required checkbox
                if (requiredCheckbox && requiredCheckbox.length > 0) {
                  for (let i = 0; i < requiredCheckbox.length; i++) {
                    //get minimum required count if  exit
                    const minCount =
                      requiredCheckbox[i].options?.validation?.minRequiredCount;
                    const parseMin = minCount && parseInt(minCount);
                    //get maximum required count if  exit
                    const maxCount =
                      requiredCheckbox[i].options?.validation?.maxRequiredCount;
                    const parseMax = maxCount && parseInt(maxCount);
                    //in `response` variable is used to get how many checkbox checked by user
                    const response =
                      requiredCheckbox[i].options?.response?.length;
                    //in `defaultValue` variable is used to get how many checkbox checked by default
                    const defaultValue =
                      requiredCheckbox[i].options?.defaultValue?.length;
                    //condition to check  parseMin  and parseMax greater than 0  then consider it as a required check box
                    if (
                      parseMin > 0 &&
                      parseMax > 0 &&
                      !response &&
                      !defaultValue &&
                      !showAlert
                    ) {
                      showAlert = true;
                      widgetKey = requiredCheckbox[i].key;
                      pageNumber = updatePage;
                      setminRequiredCount(parseMin);
                    }
                    //else condition to validate minimum required checkbox
                    else if (
                      parseMin > 0 &&
                      (parseMin > response || !response)
                    ) {
                      if (!showAlert) {
                        showAlert = true;
                        widgetKey = requiredCheckbox[i].key;
                        pageNumber = updatePage;

                        setminRequiredCount(parseMin);
                      }
                    }
                  }
                }
              }
              //condition to check radio widget exist or not
              else if (radioExist) {
                //get all required type radio button
                requiredRadio = checkUser[0].placeHolder[i].pos.filter(
                  (position) =>
                    !position.options?.isReadOnly &&
                    position.type === radioButtonWidget
                );
                //if required type radio data exit then check user checked all radio button or some radio remain to check
                if (requiredRadio && requiredRadio?.length > 0) {
                  let checkSigned;
                  for (let i = 0; i < requiredRadio?.length; i++) {
                    checkSigned = requiredRadio[i]?.options?.response;
                    if (!checkSigned) {
                      let checkDefaultSigned =
                        requiredRadio[i]?.options?.defaultValue;
                      if (!checkDefaultSigned && !showAlert) {
                        showAlert = true;
                        widgetKey = requiredRadio[i].key;
                        pageNumber = updatePage;
                        setminRequiredCount(null);
                      }
                    }
                  }
                }
              }
              //else condition to check all type widget data fill or not except checkbox and radio button
              else {
                //get all required type widgets except checkbox and radio
                const requiredWidgets = checkUser[0].placeHolder[i].pos.filter(
                  (position) =>
                    position.options?.status === "required" &&
                    position.type !== radioButtonWidget &&
                    position.type !== "checkbox"
                );
                if (requiredWidgets && requiredWidgets?.length > 0) {
                  let checkSigned;
                  for (let i = 0; i < requiredWidgets?.length; i++) {
                    checkSigned = requiredWidgets[i]?.options?.response;
                    if (!checkSigned) {
                      const checkSignUrl = requiredWidgets[i]?.pos?.SignUrl;
                      if (!checkSignUrl) {
                        let checkDefaultSigned =
                          requiredWidgets[i]?.options?.defaultValue;
                        if (!checkDefaultSigned && !showAlert) {
                          showAlert = true;
                          widgetKey = requiredWidgets[i].key;
                          pageNumber = updatePage;
                          setminRequiredCount(null);
                        }
                      }
                    }
                  }
                }
              }
            }
            //when showAlert is true then break the loop and show alert to fill required data in widgets
            if (showAlert) {
              break;
            }
          }
          if (checkboxExist && requiredCheckbox && showAlert) {
            setUnSignedWidgetId(widgetKey);
            setPageNumber(pageNumber);
            setWidgetsTour(true);
          } else if (radioExist && showAlert) {
            setUnSignedWidgetId(widgetKey);
            setPageNumber(pageNumber);
            setWidgetsTour(true);
          } else if (showAlert) {
            setUnSignedWidgetId(widgetKey);
            setPageNumber(pageNumber);
            setWidgetsTour(true);
          } else {
            setIsUiLoading(true);

            const pngUrl = checkUser[0].placeHolder;
            let pdfArrBuffer;
            //`contractDocument` function used to get updated SignedUrl
            //resolved issue of sign document by multiple signers simultaneously
            const documentData = await contractDocument(documentId);
            if (documentData && documentData.length > 0) {
              const url = documentData[0]?.SignedUrl || documentData[0]?.URL;
              //convert document url in array buffer format to use embed widgets in pdf using pdf-lib
              const arrayBuffer = await convertPdfArrayBuffer(url);
              if (arrayBuffer === "Error") {
                setHandleError("Error: invalid document!");
              } else {
                pdfArrBuffer = arrayBuffer;
              }
            } else if (
              documentData === "Error: Something went wrong!" ||
              (documentData.result && documentData.result.error)
            ) {
              setHandleError("Error: Something went wrong!");
            } else {
              setHandleError("Document not Found!");
            }

            // Load a PDFDocument from the existing PDF bytes
            const existingPdfBytes = pdfArrBuffer;
            try {
              const pdfDoc = await PDFDocument.load(existingPdfBytes);
              const isSignYourSelfFlow = false;
              const extUserPtr = pdfDetails[0].ExtUserPtr;
              const HeaderDocId = extUserPtr?.HeaderDocId;
              //embed document's object id to all pages in pdf document
              if (!HeaderDocId) {
                if (!isDocId) {
                  await embedDocId(pdfDoc, documentId, allPages);
                }
              }
              //embed multi signature in pdf
              const pdfBytes = await multiSignEmbed(
                pngUrl,
                pdfDoc,
                isSignYourSelfFlow,
                scale
              );
              //  console.log("pdfte", pdfBytes);
              //get ExistUserPtr object id of user class to get tenantDetails
              const objectId = pdfDetails?.[0]?.ExtUserPtr?.UserId?.objectId;
              //get ExistUserPtr email to get userDetails
              const currentUserEmail = pdfDetails?.[0]?.ExtUserPtr?.Email;
              const res = await contractUsers(currentUserEmail);
              let activeMailAdapter = "";
              if (res === "Error: Something went wrong!") {
                setHandleError("Error: Something went wrong!");
                setIsLoading({
                  isLoad: false
                });
              } else if (!res || res?.length === 0) {
                activeMailAdapter = "";
              } else if (res[0] && res.length) {
                activeMailAdapter = res[0]?.active_mail_adapter;
              }
              //function for call to embed signature in pdf and get digital signature pdf
              try {
                const res = await signPdfFun(
                  pdfBytes,
                  documentId,
                  signerObjectId,
                  setIsAlert,
                  objectId,
                  isSubscribed,
                  activeMailAdapter,
                  pngUrl
                );
                if (res && res.status === "success") {
                  setPdfUrl(res.data);
                  setIsSigned(true);
                  setSignedSigners([]);
                  setUnSignedSigners([]);
                  getDocumentDetails(true);
                  const index = pdfDetails?.[0].Signers.findIndex(
                    (x) => x.Email === currentUser?.email
                  );
                  const newIndex = index + 1;
                  const usermail = {
                    Email: pdfDetails?.[0]?.Placeholders[newIndex]?.email || ""
                  };
                  const user = usermail?.Email
                    ? usermail
                    : pdfDetails?.[0]?.Signers[newIndex];
                  if (sendmail !== "false" && sendInOrder) {
                    const requestBody = pdfDetails?.[0]?.RequestBody;
                    const requestSubject = pdfDetails?.[0]?.RequestSubject;
                    if (user) {
                      const expireDate = pdfDetails?.[0].ExpiryDate.iso;
                      const newDate = new Date(expireDate);
                      const localExpireDate = newDate.toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        }
                      );
                      let senderEmail = pdfDetails?.[0].ExtUserPtr.Email;
                      let senderPhone = pdfDetails?.[0]?.ExtUserPtr?.Phone;
                      const senderName = `${pdfDetails?.[0].ExtUserPtr.Name}`;

                      try {
                        const imgPng =
                          "https://qikinnovation.ams3.digitaloceanspaces.com/logo.png";
                        let url = `${localStorage.getItem(
                          "baseUrl"
                        )}functions/sendmailv3`;
                        const headers = {
                          "Content-Type": "application/json",
                          "X-Parse-Application-Id":
                            localStorage.getItem("parseAppId"),
                          sessionToken: localStorage.getItem("accesstoken")
                        };
                        const objectId = user?.objectId;
                        const hostUrl = window.location.origin;
                        //encode this url value `${pdfDetails?.[0].objectId}/${user.Email}/${objectId}` to base64 using `btoa` function
                        let encodeBase64;
                        if (objectId) {
                          encodeBase64 = btoa(
                            `${pdfDetails?.[0].objectId}/${user.Email}/${objectId}`
                          );
                        } else {
                          encodeBase64 = btoa(
                            `${pdfDetails?.[0].objectId}/${user.Email}`
                          );
                        }
                        const hostPublicUrl = isStaging
                          ? "https://staging-app.opensignlabs.com"
                          : "https://app.opensignlabs.com";
                        let signPdf = props?.templateId
                          ? `${hostPublicUrl}/login/${encodeBase64}`
                          : `${hostUrl}/login/${encodeBase64}`;
                        const openSignUrl =
                          "https://www.opensignlabs.com/contact-us";
                        const orgName = pdfDetails[0]?.ExtUserPtr.Company
                          ? pdfDetails[0].ExtUserPtr.Company
                          : "";
                        const themeBGcolor = themeColor;
                        let replaceVar;
                        if (requestBody && requestSubject && isSubscribed) {
                          const replacedRequestBody = requestBody.replace(
                            /"/g,
                            "'"
                          );
                          const htmlReqBody =
                            "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>" +
                            replacedRequestBody +
                            "</body> </html>";

                          const variables = {
                            document_title: pdfDetails?.[0].Name,
                            sender_name: senderName,
                            sender_mail: senderEmail,
                            sender_phone: senderPhone,
                            receiver_name: user.Name,
                            receiver_email: user.Email,
                            receiver_phone: user.Phone,
                            expiry_date: localExpireDate,
                            company_name: orgName,
                            signing_url: `<a href=${signPdf}>Sign here</a>`
                          };
                          replaceVar = replaceMailVaribles(
                            requestSubject,
                            htmlReqBody,
                            variables
                          );
                        }

                        let params = {
                          mailProvider: activeMailAdapter,
                          extUserId: extUserId,
                          recipient: user.Email,
                          subject: requestSubject
                            ? replaceVar?.subject
                            : `${pdfDetails?.[0].ExtUserPtr.Name} has requested you to sign "${pdfDetails?.[0].Name}"`,
                          from: senderEmail,
                          html: requestBody
                            ? replaceVar?.body
                            : "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> </head>   <body> <div style='background-color: #f5f5f5; padding: 20px'=> <div   style=' box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background: white;padding-bottom: 20px;'> <div style='padding:10px 10px 0 10px'><img src=" +
                              imgPng +
                              " height='50' style='padding: 20px,width:170px,height:40px' /></div>  <div  style=' padding: 2px;font-family: system-ui;background-color:" +
                              themeBGcolor +
                              ";'><p style='font-size: 20px;font-weight: 400;color: white;padding-left: 20px;' > Digital Signature Request</p></div><div><p style='padding: 20px;font-family: system-ui;font-size: 14px;   margin-bottom: 10px;'> " +
                              pdfDetails?.[0].ExtUserPtr.Name +
                              " has requested you to review and sign <strong> " +
                              pdfDetails?.[0].Name +
                              "</strong>.</p><div style='padding: 5px 0px 5px 25px;display: flex;flex-direction: row;justify-content: space-around;'><table> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td> <td> </td> <td  style='color:#626363;font-weight:bold'>" +
                              senderEmail +
                              "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td> <td> </td><td style='color:#626363;font-weight:bold'> " +
                              orgName +
                              "</td></tr> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expires on</td><td> </td> <td style='color:#626363;font-weight:bold'>" +
                              localExpireDate +
                              "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a href=" +
                              signPdf +
                              "> <button style='padding: 12px 12px 12px 12px;background-color: #d46b0f;color: white;  border: 0px;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;font-weight:bold;margin-top:30px'>Sign here</button></a> </div> <div style='display: flex; justify-content: center;margin-top: 10px;'> </div></div></div><div><p> This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
                              senderEmail +
                              " directly.If you think this email is inappropriate or spam, you may file a complaint with OpenSign™   <a href= " +
                              openSignUrl +
                              " target=_blank>here</a>.</p> </div></div></body> </html>"
                        };
                        await axios.post(url, params, {
                          headers: headers
                        });
                      } catch (error) {
                        console.log("error", error);
                      }
                    }
                  }
                } else {
                  setIsAlert({
                    isShow: true,
                    alertMessage: "something went wrong"
                  });
                }
              } catch (err) {
                setIsAlert({
                  isShow: true,
                  alertMessage: "something went wrong"
                });
              }
            } catch (err) {
              setIsUiLoading(false);
              if (err && err.message.includes("is encrypted.")) {
                setIsAlert({
                  isShow: true,
                  alertMessage: `Currently encrypted pdf files are not supported.`
                });
              } else {
                console.log("err in request signing", err);
                setIsAlert({
                  isShow: true,
                  alertMessage: `Something went wrong.`
                });
              }
            }
          }
          setIsSignPad(false);
        } else {
          setIsAlert({
            isShow: true,
            alertMessage: "something went wrong"
          });
        }
      } catch (err) {
        console.log("err in embedsign", err);
        setIsUiLoading(false);
        setIsAlert({
          isShow: true,
          alertMessage: "something went wrong, please try again later."
        });
      }
    } else {
      //else verify users email
      try {
        const userQuery = new Parse.Query(Parse.User);
        const user = await userQuery.get(currentUser?.objectId, {
          sessionToken: localStorage.getItem("accesstoken")
        });
        if (user) {
          isEmailVerified = user?.get("emailVerified");
          setIsEmailVerified(isEmailVerified);
        }
      } catch (e) {
        console.log("error in save user's emailVerified in user class");
        setHandleError("Error: Something went wrong!");
      }
    }
  }

  //function for update TourStatus
  const closeTour = async () => {
    setWidgetsTour(false);
  };

  const tourConfig = [
    {
      selector: '[data-tut="IsSigned"]',
      content: minRequiredCount
        ? `Please confirm that you have selected at least ${minRequiredCount} checkboxes.`
        : "Ensure this field is accurately filled and meets all requirements.",
      position: "top",
      style: { fontSize: "13px" }
    }
  ];
  //function for get pdf page details
  const pageDetails = async (pdf) => {
    let pdfWHObj = [];
    const totalPages = pdf.numPages; // Get the total number of pages
    for (let index = 0; index < totalPages; index++) {
      const getPage = await pdf.getPage(index + 1);
      const scale = 1;
      const { width, height } = getPage.getViewport({ scale });
      pdfWHObj.push({ pageNumber: index + 1, width, height });
    }
    setPdfOriginalWH(pdfWHObj);
    setPdfLoad(true);
  };
  //function for change page
  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  //function for image upload or update
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event, setImgWH, setImage);
    }
  };
  //function for upload stamp image
  const saveImage = () => {
    //get current signers placeholder position data
    const currentSigner = signerPos.filter(
      (data) => data.signerObjId === signerObjectId
    );
    //get current pagenumber placeholder index
    const getIndex = currentSigner[0].placeHolder.findIndex((object) => {
      return object.pageNumber === pageNumber;
    });
    //get current signer placeholder position data
    const placeholderPosition = currentSigner[0].placeHolder;
    //function of save image and get updated position with image url
    const getUpdatePosition = onSaveImage(
      placeholderPosition,
      getIndex,
      signKey,
      imgWH,
      image
    );

    //replace updated placeholder position with old data
    placeholderPosition.splice(
      0,
      placeholderPosition.length,
      ...getUpdatePosition
    );
    //get current signers placeholder position data index number in array
    const indexofSigner = signerPos.findIndex((object) => {
      return object.signerObjId === signerObjectId;
    });
    //update current signers data with new placeholder position array data
    setSignerPos((prevState) => {
      const newState = [...prevState]; // Create a copy of the state
      newState.splice(indexofSigner, 1, ...currentSigner); // Modify the copy
      return newState; // Update the state with the modified copy
    });
  };
  //function for save button to save signature or image url
  const saveSign = (type, isDefaultSign, width, height) => {
    const isTypeText = width && height ? true : false;
    const signatureImg = isDefaultSign
      ? isDefaultSign === "initials"
        ? myInitial
        : defaultSignImg
      : signature;
    let imgWH = { width: width ? width : "", height: height ? height : "" };
    setIsSignPad(false);
    setIsImageSelect(false);
    setImage();

    //get current signers placeholder position data
    const currentSigner = signerPos.filter(
      (data) => data.signerObjId === signerObjectId
    );
    //get current pagenumber placeholder index
    const getIndex = currentSigner[0].placeHolder.findIndex((object) => {
      return object.pageNumber === pageNumber;
    });

    //set default signature image width and height
    if (isDefaultSign) {
      const img = new Image();
      img.src = defaultSignImg;
      if (img.complete) {
        imgWH = {
          width: img.width,
          height: img.height
        };
      }
    }
    //get current signer placeholder position data
    const placeholderPosition = currentSigner[0].placeHolder;
    //function of save signature image and get updated position with signature image url
    const getUpdatePosition = onSaveSign(
      type,
      placeholderPosition,
      getIndex,
      signKey,
      signatureImg,
      imgWH,
      isDefaultSign,
      isTypeText
    );

    const updateSignerData = currentSigner.map((obj) => {
      if (obj.signerObjId === signerObjectId) {
        return { ...obj, placeHolder: getUpdatePosition };
      }
      return obj;
    });

    const index = signerPos.findIndex(
      (data) => data.signerObjId === signerObjectId
    );
    setSignerPos((prevState) => {
      const newState = [...prevState];
      newState.splice(index, 1, ...updateSignerData);
      return newState;
    });
  };
  //function for set decline true on press decline button
  const declineDoc = async (reason) => {
    const senderUser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const jsonSender = JSON.parse(senderUser);
    setIsDecline({ isDeclined: false });
    const data = { IsDeclined: true, DeclineReason: reason };
    setIsUiLoading(true);

    await axios
      .put(
        `${localStorage.getItem(
          "baseUrl"
        )}classes/contracts_Document/${documentId}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      )
      .then(async (result) => {
        const res = result.data;
        if (res) {
          const currentDecline = {
            currnt: "YouDeclined",
            isDeclined: true
          };
          setIsDecline(currentDecline);
          setIsUiLoading(false);
          const params = {
            event: "declined",
            body: {
              objectId: pdfDetails?.[0].objectId,
              file: pdfDetails?.[0]?.SignedUrl || pdfDetails?.[0]?.URL,
              name: pdfDetails?.[0].Name,
              note: pdfDetails?.[0].Note || "",
              description: pdfDetails?.[0].Description || "",
              signers: pdfDetails?.[0].Signers?.map((x) => ({
                name: x?.Name,
                email: x?.Email,
                phone: x?.Phone
              })),
              declinedBy: jsonSender.email,
              declinedAt: new Date(),
              createdAt: pdfDetails?.[0].createdAt
            }
          };

          try {
            await axios.post(
              `${localStorage.getItem("baseUrl")}functions/callwebhook`,
              params,
              {
                headers: {
                  "Content-Type": "application/json",
                  "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
                  sessiontoken: localStorage.getItem("accesstoken")
                }
              }
            );
          } catch (err) {
            console.log("Err ", err);
          }
        }
      })
      .catch((err) => {
        console.log("error updating field is decline ", err);
      });
  };
  //function to add default signature for all requested placeholder of sign
  const addDefaultSignature = () => {
    //get current signers placeholder position data
    const currentSignerPosition = signerPos.filter(
      (data) => data.signerObjId === signerObjectId
    );
    //function for save default signature url for all placeholder position
    const updatePlace = addDefaultSignatureImg(
      currentSignerPosition[0].placeHolder,
      defaultSignImg
    );

    const updatesignerPos = signerPos.map((x) =>
      x.signerObjId === signerObjectId ? { ...x, placeHolder: updatePlace } : x
    );
    setSignerPos(updatesignerPos);
    setDefaultSignAlert({
      isShow: false,
      alertMessage: ""
    });
  };
  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };
  // console.log("signerpos", signerPos);
  //function to close tour and save tour status
  const closeRequestSignTour = async () => {
    setRequestSignTour(true);
    if (isDontShow) {
      let updatedTourStatus = [];
      if (tourStatus.length > 0) {
        updatedTourStatus = [...tourStatus];
        const requestSignIndex = tourStatus.findIndex(
          (obj) => obj["requestSign"] === false || obj["requestSign"] === true
        );
        if (requestSignIndex !== -1) {
          updatedTourStatus[requestSignIndex] = { requestSign: true };
        } else {
          updatedTourStatus.push({ requestSign: true });
        }
      } else {
        updatedTourStatus = [{ requestSign: true }];
      }
      try {
        await axios.put(
          `${localStorage.getItem(
            "baseUrl"
          )}classes/contracts${contractName}/${signerUserId}`,
          {
            TourStatus: updatedTourStatus
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              "X-Parse-Session-Token": localStorage.getItem("accesstoken")
            }
          }
        );
      } catch (e) {
        console.log("update tour messages error", e);
      }
    }
  };
  const requestSignTourFunction = () => {
    const tourConfig = [
      {
        selector: '[data-tut="reactourFirst"]',
        content: () => (
          <TourContentWithBtn
            message={`List of signers who still need to sign the document .`}
            isChecked={handleDontShow}
          />
        ),
        position: "top",
        style: { fontSize: "13px" }
      },
      {
        selector: '[data-tut="pdfArea"]',
        content: () => (
          <TourContentWithBtn
            message={`Click any of the placeholders appearing on the document to sign. You will then see options to draw your signature, type it, or upload an image .`}
            isChecked={handleDontShow}
          />
        ),
        position: "top",
        style: { fontSize: "13px" }
      },
      {
        selector: '[data-tut="reactourFifth"]',
        content: () => (
          <TourContentWithBtn
            message={`Click the Back, Decline, or Finish buttons to navigate your document. Use the ellipsis menu for additional options, including the Download button .`}
            isChecked={handleDontShow}
          />
        ),
        position: "top",
        style: { fontSize: "13px" }
      }
    ];
    const signedByStep = {
      selector: '[data-tut="reactourSecond"]',
      content: () => (
        <TourContentWithBtn
          message={`List of signers who have already signed the document .`}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    };
    //checking if signed by user component exist then add signed step
    const signedBy =
      signedSigners.length > 0
        ? [...tourConfig.slice(0, 0), signedByStep, ...tourConfig.slice(0)]
        : tourConfig;

    //checking if default signature component exist then add defaultSign step
    const defaultSignStep = {
      selector: '[data-tut="reactourThird"]',
      content: () => (
        <TourContentWithBtn
          message={`You can click "Auto Sign All" to automatically sign at all the locations meant to be signed by you. Make sure that you review the document properly before you click this button .`}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    };
    //index is handle is signed by exist then 2 else 1 to add tour step
    const index = signedSigners.length > 0 ? 2 : 1;
    const defaultSignTour = defaultSignImg
      ? [...signedBy.slice(0, index), defaultSignStep, ...signedBy.slice(index)]
      : signedBy;

    if (isMobile) {
      tourConfig.shift();
    }

    return (
      <Tour
        onRequestClose={closeRequestSignTour}
        steps={isMobile ? tourConfig : defaultSignTour}
        isOpen={true}
        closeWithMask={false}
        rounded={5}
      />
    );
  };

  const handleUserDetails = () => {
    setIsPublicContact(true);
  };

  //`handlePublicUser` function to use create user from public role and create document from public template
  const handlePublicUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = {
        ...contact,
        templateid: pdfDetails[0]?.objectId,
        role: pdfDetails[0]?.PublicRole[0]
      };
      const userRes = await axios.post(
        `${localStorage.getItem(
          "baseUrl"
        )}/functions/publicuserlinkcontacttodoc`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId")
          }
        }
      );

      if (userRes?.data?.result) {
        setRes(userRes.data.result);
        await SendOtp();
      } else {
        console.log("error in public-sign to create user details");
        alert("something went wrong");
      }
    } catch (e) {
      console.log("e", e);
      //   setIsLoader(false);
    }
  };

  const handleInputChange = (e) => {
    setContact((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const SendOtp = async () => {
    try {
      const params = { email: contact.email, docId: res.docId };

      const Otp = await axios.post(
        `${localStorage.getItem("baseUrl")}/functions/SendOTPMailV1`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId")
          }
        }
      );

      if (Otp) {
        setIsOtp(true);
        setLoading(false);
      }
    } catch (error) {
      console.log("error in verify otp in public-sign", error);
      alert("something went wrong!");
    }
  };

  //verify OTP send on via email
  const VerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const serverUrl =
      localStorage.getItem("baseUrl") && localStorage.getItem("baseUrl");
    const parseId =
      localStorage.getItem("parseAppId") && localStorage.getItem("parseAppId");
    if (otp) {
      // setLoading(true);
      try {
        let url = `${serverUrl}/functions/AuthLoginAsMail/`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseId
        };
        let body = {
          email: contact.email,
          otp: otp
        };
        let user = await axios.post(url, body, { headers: headers });
        if (user.data.result === "Invalid Otp") {
          alert("Invalid Otp");
          setLoading(false);
        } else if (user.data.result === "user not found!") {
          alert("User not found!");
          setLoading(false);
        } else {
          let _user = user.data.result;
          const parseId = localStorage.getItem("parseAppId");
          const contractUserDetails = await contractUsers(_user.email);
          localStorage.setItem("UserInformation", JSON.stringify(_user));
          localStorage.setItem(
            `Parse/${parseId}/currentUser`,
            JSON.stringify(_user)
          );
          if (contractUserDetails && contractUserDetails.length > 0) {
            localStorage.setItem(
              "Extand_Class",
              JSON.stringify(contractUserDetails)
            );
          }

          localStorage.setItem("username", _user.name);
          localStorage.setItem("accesstoken", _user.sessionToken);
          setLoading(false);
          // navigate(`/load/recipientSignPdf/${res?.docId}/${res?.contactId}`);
          // document.getElementById("my_modal").close();
          setIsPublicContact(false);
          setIsPublicTemplate(false);
          setIsLoading({
            isLoad: false
          });
          setDocumentId(res?.docId);
          getDocumentDetails(res?.docId);
        }
      } catch (error) {
        console.log("err ", error);
      }
    } else {
      alert("Please Enter OTP!");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Title title={props.templateId ? "Public Sign" : "Request Sign"} />
      {isSubscriptionExpired ? (
        <ModalUi
          title={"Subscription Expired"}
          isOpen={isSubscriptionExpired}
          showClose={false}
        >
          <div className="flex flex-col justify-center items-center py-4 md:py-5 gap-5">
            <p className="text-sm md:text-lg font-normal">
              Owner&apos;s subscription has expired.
            </p>
          </div>
        </ModalUi>
      ) : (
        <>
          {isLoading.isLoad ? (
            <LoaderWithMsg isLoading={isLoading} />
          ) : handleError ? (
            <HandleError handleError={handleError} />
          ) : (
            <div>
              {isUiLoading && (
                <div className="absolute h-[100vh] w-full flex flex-col justify-center items-center z-[999] bg-[#e6f2f2] bg-opacity-80">
                  <Loader />
                  <span className="text-[13px] text-base-content">
                    This might take some time
                  </span>
                </div>
              )}
              {isCelebration && (
                <div className="relative z-[1000]">
                  <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                  />
                </div>
              )}
              <div
                style={{
                  pointerEvents:
                    isExpired ||
                    (isDecline.isDeclined && isDecline.currnt === "another")
                      ? "none"
                      : "auto"
                }}
                className="relative op-card overflow-hidden flex flex-col md:flex-row justify-between bg-base-300"
              >
                {!requestSignTour &&
                  signerObjectId &&
                  requestSignTourFunction()}
                <ModalUi
                  isOpen={isAlert.isShow}
                  title={"Alert message"}
                  handleClose={() => {
                    setIsAlert({
                      isShow: false,
                      alertMessage: ""
                    });
                  }}
                >
                  <div className="h-full p-[20px]">
                    <p>{isAlert.alertMessage}</p>
                    <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
                    <button
                      onClick={() => {
                        setIsAlert({
                          isShow: false,
                          alertMessage: ""
                        });
                      }}
                      type="button"
                      className="op-btn op-btn-primary"
                    >
                      Ok
                    </button>
                  </div>
                </ModalUi>

                <Tour
                  showNumber={false}
                  showNavigation={false}
                  showNavigationNumber={false}
                  onRequestClose={closeTour}
                  steps={tourConfig}
                  isOpen={widgetsTour}
                  rounded={5}
                  closeWithMask={false}
                />

                {/* this modal is used to show decline alert */}
                <PdfDeclineModal
                  show={isDecline.isDeclined}
                  headMsg="Document declined"
                  bodyMssg={
                    isDecline.currnt === "Sure"
                      ? "Are you sure want to decline this document ?"
                      : isDecline.currnt === "YouDeclined"
                        ? "You have declined this document!"
                        : isDecline.currnt === "another" &&
                          "You can not sign this document as it has been declined/revoked."
                  }
                  footerMessage={isDecline.currnt === "Sure"}
                  declineDoc={declineDoc}
                  setIsDecline={setIsDecline}
                />
                {/* this modal is used for show expired alert */}
                <PdfDeclineModal
                  show={isExpired}
                  headMsg="Document expired"
                  bodyMssg={`This document expired on ${expiredDate} and is no longer available to sign.`}
                />
                {!isEmailVerified && (
                  <VerifyEmail
                    isVerifyModal={isVerifyModal}
                    setIsVerifyModal={setIsVerifyModal}
                    handleVerifyEmail={handleVerifyEmail}
                    setOtp={setOtp}
                    otp={otp}
                    otpLoader={otpLoader}
                    handleVerifyBtn={handleVerifyBtn}
                    handleResend={handleResend}
                  />
                )}

                <ModalUi
                  isOpen={isPublicContact}
                  title={"Contact Details"}
                  handleClose={() => {
                    setIsPublicContact(false);
                  }}
                >
                  <div className="h-full p-[20px]">
                    {isOtp ? (
                      <form onSubmit={VerifyOTP}>
                        <div className="flex flex-col gap-2">
                          <span>You will get a OTP via Email</span>
                          <label className="op-input op-input-bordered flex items-center gap-2 ">
                            <input
                              type="number"
                              name="otp"
                              className="grow"
                              placeholder="Enter Verification Code"
                              required
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              disabled={loading}
                            />
                          </label>
                        </div>
                        <div className="op-modal-action">
                          <div className="flex gap-2">
                            <button
                              className="op-btn op-btn-ghost"
                              onClick={() => {
                                // document.getElementById("my_modal").close();
                                setIsPublicContact(false);
                                setLoading(false);
                                setIsOtp(false);
                                setOtp();
                                setContact({
                                  name: "",
                                  email: "",
                                  phone: ""
                                });
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="op-btn op-btn-primary"
                              disabled={loading}
                            >
                              {loading ? "Loading..." : "Verify"}
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handlePublicUser}>
                        <div className="flex flex-col gap-2">
                          <label className="op-input op-input-bordered  flex items-center gap-2  ">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              className="w-4 h-4 opacity-70"
                            >
                              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                            </svg>
                            <input
                              type="text"
                              className="grow"
                              name="name"
                              value={contact.name}
                              onChange={handleInputChange}
                              placeholder="name"
                              required
                              disabled={loading}
                            />
                          </label>
                          <label className="op-input op-input-bordered flex items-center gap-2 ">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              className="w-4 h-4 opacity-70"
                            >
                              <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                              <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                            </svg>
                            <input
                              type="text"
                              className="grow"
                              name="email"
                              value={contact.email}
                              onChange={handleInputChange}
                              placeholder="Email"
                              required
                              disabled={loading}
                            />
                          </label>

                          <label className="op-input op-input-bordered flex items-center gap-2 ">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              className="w-4 h-4 opacity-70"
                            >
                              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                            </svg>
                            <input
                              value={contact.phone}
                              onChange={handleInputChange}
                              type="text"
                              name="phone"
                              className="grow"
                              placeholder="phone"
                              disabled={loading}
                            />
                          </label>
                        </div>
                        <div className="op-modal-action">
                          <div className="flex gap-2">
                            <button
                              className="op-btn op-btn-ghost"
                              onClick={() => {
                                // document.getElementById("my_modal").close();
                                setIsPublicContact(false);
                              }}
                            >
                              Close
                            </button>
                            <button
                              className="op-btn op-btn-primary"
                              disabled={loading}
                            >
                              {loading ? "Loading..." : "Submit"}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </ModalUi>
                <ModalUi
                  isOpen={defaultSignAlert.isShow}
                  title={"Auto sign"}
                  handleClose={() =>
                    setDefaultSignAlert({ isShow: false, alertMessage: "" })
                  }
                >
                  <div className="h-full p-[20px]">
                    <p>{defaultSignAlert.alertMessage}</p>
                    <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
                    {defaultSignImg ? (
                      <>
                        <button
                          onClick={() => addDefaultSignature()}
                          type="button"
                          className="op-btn op-btn-primary"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() =>
                            setDefaultSignAlert({
                              isShow: false,
                              alertMessage: ""
                            })
                          }
                          type="button"
                          className="op-btn op-btn-secondary"
                        >
                          Close
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          setIsAlert({ isShow: false, alertMessage: "" })
                        }
                        type="button"
                        className="op-btn op-btn-primary"
                      >
                        Ok
                      </button>
                    )}
                  </div>
                </ModalUi>
                {/* this component used to render all pdf pages in left side */}
                <RenderAllPdfPage
                  signerPos={signerPos}
                  signerObjectId={signerObjectId}
                  signPdfUrl={
                    pdfDetails[0] &&
                    (pdfDetails[0]?.SignedUrl || pdfDetails[0]?.URL)
                  }
                  allPages={allPages}
                  setAllPages={setAllPages}
                  setPageNumber={setPageNumber}
                  pageNumber={pageNumber}
                  containerWH={containerWH}
                />
                {/* pdf render view */}
                <div className=" w-full md:w-[57%] flex mr-4">
                  <PdfZoom
                    setScale={setScale}
                    scale={scale}
                    containerWH={containerWH}
                    setZoomPercent={setZoomPercent}
                    zoomPercent={zoomPercent}
                  />
                  <div className=" w-full md:w-[95%] ">
                    {/* this modal is used show this document is already sign */}
                    <ModalUi
                      isOpen={isCompleted.isModal}
                      title={"Document signed"}
                      handleClose={() => {
                        setIsCompleted((prev) => ({ ...prev, isModal: false }));
                      }}
                      reduceWidth={
                        !isCompleted?.message &&
                        "md:min-w-[440px] md:max-w-[400px]"
                      }
                    >
                      <div className="h-full p-[20px] text-base-content">
                        {isCompleted?.message ? (
                          <p>{isCompleted?.message}</p>
                        ) : (
                          <div className="px-[15px]">
                            <span>
                              Congratulations! 🎉 This document has been
                              successfully signed by all participants!
                            </span>
                          </div>
                        )}
                        {!isCompleted?.message && (
                          <div className="flex mt-4 gap-1 px-[15px]">
                            <button
                              onClick={(e) =>
                                handleToPrint(e, pdfUrl, setIsDownloading)
                              }
                              type="button"
                              className="font-[500] text-[13px] mr-[5px] op-btn op-btn-neutral"
                            >
                              <i
                                className="fa-light fa-print"
                                aria-hidden="true"
                              ></i>
                              <span className="hidden lg:block">Print</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadCertificate(
                                  pdfDetails,
                                  setIsDownloading
                                )
                              }
                              className="font-[500] text-[13px] mr-[5px] op-btn op-btn-secondary"
                            >
                              <i
                                className="fa-light fa-award mx-[3px] lg:mx-0"
                                aria-hidden="true"
                              ></i>
                              <span className="hidden lg:block">
                                Certificate
                              </span>
                            </button>
                            <button
                              type="button"
                              className="font-[500] text-[13px] mr-[5px] op-btn op-btn-primary"
                              onClick={() =>
                                handleDownloadPdf(
                                  pdfDetails,
                                  pdfUrl,
                                  setIsDownloading
                                )
                              }
                            >
                              <i
                                className="fa-light fa-download"
                                aria-hidden="true"
                              ></i>
                              <span className="hidden lg:block">Download</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </ModalUi>
                    {isDownloading === "pdf" && (
                      <div className="fixed z-[1000] inset-0 flex justify-center items-center bg-black bg-opacity-30">
                        <Loader />
                      </div>
                    )}
                    <ModalUi
                      isOpen={isDownloading === "certificate"}
                      title={
                        isDownloading === "certificate"
                          ? "Generating certificate"
                          : "PDF Download"
                      }
                      handleClose={() => setIsDownloading("")}
                    >
                      <div className="p-3 md:p-5 text-[13px] md:text-base text-center text-base-content">
                        {isDownloading === "certificate"}{" "}
                        <p>
                          Your completion certificate is being generated. Please
                          wait momentarily. If the download doesn&apos;t start
                          shortly, click the button again.
                        </p>
                      </div>
                    </ModalUi>
                    {/* this component is used for signature pad modal */}
                    <SignPad
                      isSignPad={isSignPad}
                      isStamp={isStamp}
                      setIsImageSelect={setIsImageSelect}
                      setIsSignPad={setIsSignPad}
                      setImage={setImage}
                      isImageSelect={isImageSelect}
                      imageRef={imageRef}
                      onImageChange={onImageChange}
                      setSignature={setSignature}
                      image={image}
                      onSaveImage={saveImage}
                      onSaveSign={saveSign}
                      defaultSign={defaultSignImg}
                      myInitial={myInitial}
                      isInitial={isInitial}
                      setIsInitial={setIsInitial}
                      setIsStamp={setIsStamp}
                      currWidgetsDetails={currWidgetsDetails}
                      setCurrWidgetsDetails={setCurrWidgetsDetails}
                    />
                    {/* pdf header which contain funish back button */}
                    <Header
                      isPdfRequestFiles={isPublicTemplate ? false : true}
                      pageNumber={pageNumber}
                      allPages={allPages}
                      changePage={changePage}
                      pdfDetails={pdfDetails}
                      signerPos={signerPos}
                      isSigned={isSigned}
                      isCompleted={isCompleted.isCertificate}
                      embedWidgetsData={
                        isPublicTemplate ? handleUserDetails : embedWidgetsData
                      }
                      isShowHeader={true}
                      setIsDecline={setIsDecline}
                      decline={true}
                      currentSigner={currentSigner}
                      pdfUrl={pdfUrl}
                      alreadySign={alreadySign}
                      totalZoomPercent={totalZoomPercent}
                      setTotalZoomPercent={setTotalZoomPercent}
                      setScale={setScale}
                      scale={scale}
                      pdfOriginalWH={pdfOriginalWH}
                      containerWH={containerWH}
                      setZoomPercent={setZoomPercent}
                      zoomPercent={zoomPercent}
                      isPublicTemplate={isPublicTemplate}
                    />

                    <div ref={divRef} data-tut="pdfArea" className="h-[95%]">
                      {containerWH && (
                        <RenderPdf
                          pageNumber={pageNumber}
                          pdfOriginalWH={pdfOriginalWH}
                          pdfNewWidth={pdfNewWidth}
                          setIsSignPad={setIsSignPad}
                          setIsStamp={setIsStamp}
                          setSignKey={setSignKey}
                          pdfDetails={pdfDetails}
                          signerPos={signerPos}
                          successEmail={false}
                          pdfUrl={pdfUrl}
                          numPages={numPages}
                          pageDetails={pageDetails}
                          pdfRequest={true}
                          signerObjectId={signerObjectId}
                          signedSigners={signedSigners}
                          setPdfLoad={setPdfLoad}
                          pdfLoad={pdfLoad}
                          setSignerPos={setSignerPos}
                          containerWH={containerWH}
                          setIsInitial={setIsInitial}
                          setValidateAlert={setValidateAlert}
                          unSignedWidgetId={unSignedWidgetId}
                          setSelectWidgetId={setSelectWidgetId}
                          selectWidgetId={selectWidgetId}
                          setCurrWidgetsDetails={setCurrWidgetsDetails}
                          divRef={divRef}
                          setIsResize={setIsResize}
                          isResize={isResize}
                          setTotalZoomPercent={setTotalZoomPercent}
                          setScale={setScale}
                          scale={scale}
                          uniqueId={uniqueId}
                          ispublicTemplate={isPublicTemplate}
                          handleUserDetails={handleUserDetails}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[23%] bg-base-100 overflow-y-auto hide-scrollbar hidden md:inline-block">
                  <div className={`max-h-screen`}>
                    {signedSigners.length > 0 && (
                      <>
                        <div
                          data-tut="reactourSecond"
                          className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300"
                        >
                          <span> Signed by</span>
                        </div>
                        <div className="mt-[2px]">
                          {signedSigners.map((obj, ind) => {
                            return (
                              <div key={ind}>
                                <SignerListComponent
                                  ind={ind}
                                  obj={obj}
                                  isMenu={isHeader}
                                  signerPos={signerPos}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {unsignedSigners.length > 0 && (
                      <>
                        <div
                          data-tut="reactourFirst"
                          className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300"
                        >
                          <span>Yet to sign</span>
                        </div>
                        <div className="mt-[5px]">
                          {unsignedSigners.map((obj, ind) => {
                            return (
                              <div key={ind}>
                                <SignerListComponent
                                  ind={ind}
                                  obj={obj}
                                  isMenu={isHeader}
                                  signerPos={signerPos}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                    {defaultSignImg && !alreadySign && currentSigner && (
                      <DefaultSignature
                        defaultSignImg={defaultSignImg}
                        setDefaultSignImg={setDefaultSignImg}
                        userObjectId={signerObjectId}
                        setIsLoading={setIsLoading}
                        xyPostion={signerPos}
                        setDefaultSignAlert={setDefaultSignAlert}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <ModalUi
            isOpen={validateAlert}
            title={"Validation alert"}
            handleClose={() => {
              setValidateAlert(false);
            }}
          >
            <div className="h-[100%] p-[20px]">
              <p>
                The input does not meet the criteria set by the regular
                expression.
              </p>
              <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
              <button
                onClick={() => setValidateAlert(false)}
                type="button"
                className="op-btn op-btn-ghost"
              >
                Close
              </button>
            </div>
          </ModalUi>
        </>
      )}
    </DndProvider>
  );
}
export default PdfRequestFiles;

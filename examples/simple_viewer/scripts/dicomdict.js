/*
 * This dictionary was created based on the JSON documents provided by
 * https://github.com/innolitics/dicom-standard
 */
var dicomDict = {
    "00080001":{
        "tag":"(0008,0001)",
        "name":"Length to End",
        "keyword":"LengthToEnd",
        "vr":"UL",
        "vm":"1",
        "retired":true
    },
    "00080005":{
        "tag":"(0008,0005)",
        "name":"Specific Character Set",
        "keyword":"SpecificCharacterSet",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00080006":{
        "tag":"(0008,0006)",
        "name":"Language Code Sequence",
        "keyword":"LanguageCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080008":{
        "tag":"(0008,0008)",
        "name":"Image Type",
        "keyword":"ImageType",
        "vr":"CS",
        "vm":"2-n",
        "retired":false
    },
    "00080010":{
        "tag":"(0008,0010)",
        "name":"Recognition Code",
        "keyword":"RecognitionCode",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "00080012":{
        "tag":"(0008,0012)",
        "name":"Instance Creation Date",
        "keyword":"InstanceCreationDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00080013":{
        "tag":"(0008,0013)",
        "name":"Instance Creation Time",
        "keyword":"InstanceCreationTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00080014":{
        "tag":"(0008,0014)",
        "name":"Instance Creator UID",
        "keyword":"InstanceCreatorUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00080015":{
        "tag":"(0008,0015)",
        "name":"Instance Coercion DateTime",
        "keyword":"InstanceCoercionDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00080016":{
        "tag":"(0008,0016)",
        "name":"SOP Class UID",
        "keyword":"SOPClassUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00080018":{
        "tag":"(0008,0018)",
        "name":"SOP Instance UID",
        "keyword":"SOPInstanceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0008001A":{
        "tag":"(0008,001A)",
        "name":"Related General SOP Class UID",
        "keyword":"RelatedGeneralSOPClassUID",
        "vr":"UI",
        "vm":"1-n",
        "retired":false
    },
    "0008001B":{
        "tag":"(0008,001B)",
        "name":"Original Specialized SOP Class UID",
        "keyword":"OriginalSpecializedSOPClassUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00080020":{
        "tag":"(0008,0020)",
        "name":"Study Date",
        "keyword":"StudyDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00080021":{
        "tag":"(0008,0021)",
        "name":"Series Date",
        "keyword":"SeriesDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00080022":{
        "tag":"(0008,0022)",
        "name":"Acquisition Date",
        "keyword":"AcquisitionDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00080023":{
        "tag":"(0008,0023)",
        "name":"Content Date",
        "keyword":"ContentDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00080024":{
        "tag":"(0008,0024)",
        "name":"Overlay Date",
        "keyword":"OverlayDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "00080025":{
        "tag":"(0008,0025)",
        "name":"Curve Date",
        "keyword":"CurveDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "0008002A":{
        "tag":"(0008,002A)",
        "name":"Acquisition DateTime",
        "keyword":"AcquisitionDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00080030":{
        "tag":"(0008,0030)",
        "name":"Study Time",
        "keyword":"StudyTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00080031":{
        "tag":"(0008,0031)",
        "name":"Series Time",
        "keyword":"SeriesTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00080032":{
        "tag":"(0008,0032)",
        "name":"Acquisition Time",
        "keyword":"AcquisitionTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00080033":{
        "tag":"(0008,0033)",
        "name":"Content Time",
        "keyword":"ContentTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00080034":{
        "tag":"(0008,0034)",
        "name":"Overlay Time",
        "keyword":"OverlayTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "00080035":{
        "tag":"(0008,0035)",
        "name":"Curve Time",
        "keyword":"CurveTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "00080040":{
        "tag":"(0008,0040)",
        "name":"Data Set Type",
        "keyword":"DataSetType",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00080041":{
        "tag":"(0008,0041)",
        "name":"Data Set Subtype",
        "keyword":"DataSetSubtype",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00080042":{
        "tag":"(0008,0042)",
        "name":"Nuclear Medicine Series Type",
        "keyword":"NuclearMedicineSeriesType",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00080050":{
        "tag":"(0008,0050)",
        "name":"Accession Number",
        "keyword":"AccessionNumber",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00080051":{
        "tag":"(0008,0051)",
        "name":"Issuer of Accession Number Sequence",
        "keyword":"IssuerOfAccessionNumberSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080052":{
        "tag":"(0008,0052)",
        "name":"Query/Retrieve Level",
        "keyword":"QueryRetrieveLevel",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00080053":{
        "tag":"(0008,0053)",
        "name":"Query/Retrieve View",
        "keyword":"QueryRetrieveView",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00080054":{
        "tag":"(0008,0054)",
        "name":"Retrieve AE Title",
        "keyword":"RetrieveAETitle",
        "vr":"AE",
        "vm":"1-n",
        "retired":false
    },
    "00080055":{
        "tag":"(0008,0055)",
        "name":"Station  AE Title",
        "keyword":"StationAETitle",
        "vr":"AE",
        "vm":"1",
        "retired":false
    },
    "00080056":{
        "tag":"(0008,0056)",
        "name":"Instance Availability",
        "keyword":"InstanceAvailability",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00080058":{
        "tag":"(0008,0058)",
        "name":"Failed SOP Instance UID List",
        "keyword":"FailedSOPInstanceUIDList",
        "vr":"UI",
        "vm":"1-n",
        "retired":false
    },
    "00080060":{
        "tag":"(0008,0060)",
        "name":"Modality",
        "keyword":"Modality",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00080061":{
        "tag":"(0008,0061)",
        "name":"Modalities in Study",
        "keyword":"ModalitiesInStudy",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00080062":{
        "tag":"(0008,0062)",
        "name":"SOP Classes in Study",
        "keyword":"SOPClassesInStudy",
        "vr":"UI",
        "vm":"1-n",
        "retired":false
    },
    "00080063":{
        "tag":"(0008,0063)",
        "name":"Anatomic Regions in Study Code Sequence",
        "keyword":"AnatomicRegionsInStudyCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080064":{
        "tag":"(0008,0064)",
        "name":"Conversion Type",
        "keyword":"ConversionType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00080068":{
        "tag":"(0008,0068)",
        "name":"Presentation Intent Type",
        "keyword":"PresentationIntentType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00080070":{
        "tag":"(0008,0070)",
        "name":"Manufacturer",
        "keyword":"Manufacturer",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00080080":{
        "tag":"(0008,0080)",
        "name":"Institution Name",
        "keyword":"InstitutionName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00080081":{
        "tag":"(0008,0081)",
        "name":"Institution Address",
        "keyword":"InstitutionAddress",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00080082":{
        "tag":"(0008,0082)",
        "name":"Institution Code Sequence",
        "keyword":"InstitutionCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080090":{
        "tag":"(0008,0090)",
        "name":"Referring Physician's Name",
        "keyword":"ReferringPhysicianName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00080092":{
        "tag":"(0008,0092)",
        "name":"Referring Physician's Address",
        "keyword":"ReferringPhysicianAddress",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00080094":{
        "tag":"(0008,0094)",
        "name":"Referring Physician's Telephone Numbers",
        "keyword":"ReferringPhysicianTelephoneNumbers",
        "vr":"SH",
        "vm":"1-n",
        "retired":false
    },
    "00080096":{
        "tag":"(0008,0096)",
        "name":"Referring Physician Identification Sequence",
        "keyword":"ReferringPhysicianIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0008009C":{
        "tag":"(0008,009C)",
        "name":"Consulting Physician's Name",
        "keyword":"ConsultingPhysicianName",
        "vr":"PN",
        "vm":"1-n",
        "retired":false
    },
    "0008009D":{
        "tag":"(0008,009D)",
        "name":"Consulting Physician Identification Sequence",
        "keyword":"ConsultingPhysicianIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080100":{
        "tag":"(0008,0100)",
        "name":"Code Value",
        "keyword":"CodeValue",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00080101":{
        "tag":"(0008,0101)",
        "name":"Extended Code Value",
        "keyword":"ExtendedCodeValue",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00080102":{
        "tag":"(0008,0102)",
        "name":"Coding Scheme Designator",
        "keyword":"CodingSchemeDesignator",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00080103":{
        "tag":"(0008,0103)",
        "name":"Coding Scheme Version",
        "keyword":"CodingSchemeVersion",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00080104":{
        "tag":"(0008,0104)",
        "name":"Code Meaning",
        "keyword":"CodeMeaning",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00080105":{
        "tag":"(0008,0105)",
        "name":"Mapping Resource",
        "keyword":"MappingResource",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00080106":{
        "tag":"(0008,0106)",
        "name":"Context Group Version",
        "keyword":"ContextGroupVersion",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00080107":{
        "tag":"(0008,0107)",
        "name":"Context Group Local Version",
        "keyword":"ContextGroupLocalVersion",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00080108":{
        "tag":"(0008,0108)",
        "name":"Extended Code Meaning",
        "keyword":"ExtendedCodeMeaning",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00080109":{
        "tag":"(0008,0109)",
        "name":"Coding Scheme Resources Sequence",
        "keyword":"CodingSchemeResourcesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0008010A":{
        "tag":"(0008,010A)",
        "name":"Coding Scheme URL Type",
        "keyword":"CodingSchemeURLType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0008010B":{
        "tag":"(0008,010B)",
        "name":"Context Group Extension Flag",
        "keyword":"ContextGroupExtensionFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0008010C":{
        "tag":"(0008,010C)",
        "name":"Coding Scheme UID",
        "keyword":"CodingSchemeUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0008010D":{
        "tag":"(0008,010D)",
        "name":"Context Group Extension Creator UID",
        "keyword":"ContextGroupExtensionCreatorUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0008010E":{
        "tag":"(0008,010E)",
        "name":"Coding Scheme URL",
        "keyword":"CodingSchemeURL",
        "vr":"UR",
        "vm":"1",
        "retired":false
    },
    "0008010F":{
        "tag":"(0008,010F)",
        "name":"Context Identifier",
        "keyword":"ContextIdentifier",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00080110":{
        "tag":"(0008,0110)",
        "name":"Coding Scheme Identification Sequence",
        "keyword":"CodingSchemeIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080112":{
        "tag":"(0008,0112)",
        "name":"Coding Scheme Registry",
        "keyword":"CodingSchemeRegistry",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00080114":{
        "tag":"(0008,0114)",
        "name":"Coding Scheme External ID",
        "keyword":"CodingSchemeExternalID",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00080115":{
        "tag":"(0008,0115)",
        "name":"Coding Scheme Name",
        "keyword":"CodingSchemeName",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00080116":{
        "tag":"(0008,0116)",
        "name":"Coding Scheme Responsible Organization",
        "keyword":"CodingSchemeResponsibleOrganization",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00080117":{
        "tag":"(0008,0117)",
        "name":"Context UID",
        "keyword":"ContextUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00080118":{
        "tag":"(0008,0118)",
        "name":"Mapping Resource UID",
        "keyword":"MappingResourceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00080119":{
        "tag":"(0008,0119)",
        "name":"Long Code Value",
        "keyword":"LongCodeValue",
        "vr":"UC",
        "vm":"1",
        "retired":false
    },
    "00080120":{
        "tag":"(0008,0120)",
        "name":"URN Code Value",
        "keyword":"URNCodeValue",
        "vr":"UR",
        "vm":"1",
        "retired":false
    },
    "00080121":{
        "tag":"(0008,0121)",
        "name":"Equivalent Code Sequence",
        "keyword":"EquivalentCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080122":{
        "tag":"(0008,0122)",
        "name":"Mapping Resource Name",
        "keyword":"MappingResourceName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00080123":{
        "tag":"(0008,0123)",
        "name":"Context Group Identification Sequence",
        "keyword":"ContextGroupIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080124":{
        "tag":"(0008,0124)",
        "name":"Mapping Resource Identification Sequence",
        "keyword":"MappingResourceIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080201":{
        "tag":"(0008,0201)",
        "name":"Timezone Offset From UTC",
        "keyword":"TimezoneOffsetFromUTC",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00080220":{
        "tag":"(0008,0220)",
        "name":"Responsible Group Code Sequence",
        "keyword":"ResponsibleGroupCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080221":{
        "tag":"(0008,0221)",
        "name":"Equipment Modality",
        "keyword":"EquipmentModality",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00080222":{
        "tag":"(0008,0222)",
        "name":"Manufacturer's Related Model Group",
        "keyword":"ManufacturerRelatedModelGroup",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00080300":{
        "tag":"(0008,0300)",
        "name":"Private Data Element Characteristics Sequence",
        "keyword":"PrivateDataElementCharacteristicsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080301":{
        "tag":"(0008,0301)",
        "name":"Private Group Reference",
        "keyword":"PrivateGroupReference",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00080302":{
        "tag":"(0008,0302)",
        "name":"Private Creator Reference",
        "keyword":"PrivateCreatorReference",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00080303":{
        "tag":"(0008,0303)",
        "name":"Block Identifying Information Status",
        "keyword":"BlockIdentifyingInformationStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00080304":{
        "tag":"(0008,0304)",
        "name":"Nonidentifying Private Elements",
        "keyword":"NonidentifyingPrivateElements",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00080306":{
        "tag":"(0008,0306)",
        "name":"Identifying Private Elements",
        "keyword":"IdentifyingPrivateElements",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00080305":{
        "tag":"(0008,0305)",
        "name":"Deidentification Action Sequence",
        "keyword":"DeidentificationActionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00080307":{
        "tag":"(0008,0307)",
        "name":"Deidentification Action",
        "keyword":"DeidentificationAction",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00080308":{
        "tag":"(0008,0308)",
        "name":"Private Data Element",
        "keyword":"PrivateDataElement",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00080309":{
        "tag":"(0008,0309)",
        "name":"Private Data Element Value Multiplicity",
        "keyword":"PrivateDataElementValueMultiplicity",
        "vr":"UL",
        "vm":"1-3",
        "retired":false
    },
    "0008030A":{
        "tag":"(0008,030A)",
        "name":"Private Data Element Value Representation",
        "keyword":"PrivateDataElementValueRepresentation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0008030B":{
        "tag":"(0008,030B)",
        "name":"Private Data Element Number of Items",
        "keyword":"PrivateDataElementNumberOfItems",
        "vr":"UL",
        "vm":"1-2",
        "retired":false
    },
    "0008030C":{
        "tag":"(0008,030C)",
        "name":"Private Data Element Name",
        "keyword":"PrivateDataElementName",
        "vr":"UC",
        "vm":"1",
        "retired":false
    },
    "0008030D":{
        "tag":"(0008,030D)",
        "name":"Private Data Element Keyword",
        "keyword":"PrivateDataElementKeyword",
        "vr":"UC",
        "vm":"1",
        "retired":false
    },
    "0008030E":{
        "tag":"(0008,030E)",
        "name":"Private Data Element Description",
        "keyword":"PrivateDataElementDescription",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "0008030F":{
        "tag":"(0008,030F)",
        "name":"Private Data Element Encoding",
        "keyword":"PrivateDataElementEncoding",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00080310":{
        "tag":"(0008,0310)",
        "name":"Private Data Element Definition Sequence",
        "keyword":"PrivateDataElementDefinitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081000":{
        "tag":"(0008,1000)",
        "name":"Network ID",
        "keyword":"NetworkID",
        "vr":"AE",
        "vm":"1",
        "retired":true
    },
    "00081010":{
        "tag":"(0008,1010)",
        "name":"Station Name",
        "keyword":"StationName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00081030":{
        "tag":"(0008,1030)",
        "name":"Study Description",
        "keyword":"StudyDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00081032":{
        "tag":"(0008,1032)",
        "name":"Procedure Code Sequence",
        "keyword":"ProcedureCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0008103E":{
        "tag":"(0008,103E)",
        "name":"Series Description",
        "keyword":"SeriesDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0008103F":{
        "tag":"(0008,103F)",
        "name":"Series Description Code Sequence",
        "keyword":"SeriesDescriptionCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081040":{
        "tag":"(0008,1040)",
        "name":"Institutional Department Name",
        "keyword":"InstitutionalDepartmentName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00081048":{
        "tag":"(0008,1048)",
        "name":"Physician(s) of Record",
        "keyword":"PhysiciansOfRecord",
        "vr":"PN",
        "vm":"1-n",
        "retired":false
    },
    "00081049":{
        "tag":"(0008,1049)",
        "name":"Physician(s) of Record Identification Sequence",
        "keyword":"PhysiciansOfRecordIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081050":{
        "tag":"(0008,1050)",
        "name":"Performing Physician's Name",
        "keyword":"PerformingPhysicianName",
        "vr":"PN",
        "vm":"1-n",
        "retired":false
    },
    "00081052":{
        "tag":"(0008,1052)",
        "name":"Performing Physician Identification Sequence",
        "keyword":"PerformingPhysicianIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081060":{
        "tag":"(0008,1060)",
        "name":"Name of Physician(s) Reading Study",
        "keyword":"NameOfPhysiciansReadingStudy",
        "vr":"PN",
        "vm":"1-n",
        "retired":false
    },
    "00081062":{
        "tag":"(0008,1062)",
        "name":"Physician(s) Reading Study Identification Sequence",
        "keyword":"PhysiciansReadingStudyIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081070":{
        "tag":"(0008,1070)",
        "name":"Operators' Name",
        "keyword":"OperatorsName",
        "vr":"PN",
        "vm":"1-n",
        "retired":false
    },
    "00081072":{
        "tag":"(0008,1072)",
        "name":"Operator Identification Sequence",
        "keyword":"OperatorIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081080":{
        "tag":"(0008,1080)",
        "name":"Admitting Diagnoses Description",
        "keyword":"AdmittingDiagnosesDescription",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00081084":{
        "tag":"(0008,1084)",
        "name":"Admitting Diagnoses Code Sequence",
        "keyword":"AdmittingDiagnosesCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081090":{
        "tag":"(0008,1090)",
        "name":"Manufacturer's Model Name",
        "keyword":"ManufacturerModelName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00081100":{
        "tag":"(0008,1100)",
        "name":"Referenced Results Sequence",
        "keyword":"ReferencedResultsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00081110":{
        "tag":"(0008,1110)",
        "name":"Referenced Study Sequence",
        "keyword":"ReferencedStudySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081111":{
        "tag":"(0008,1111)",
        "name":"Referenced Performed Procedure Step Sequence",
        "keyword":"ReferencedPerformedProcedureStepSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081115":{
        "tag":"(0008,1115)",
        "name":"Referenced Series Sequence",
        "keyword":"ReferencedSeriesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081120":{
        "tag":"(0008,1120)",
        "name":"Referenced Patient Sequence",
        "keyword":"ReferencedPatientSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081125":{
        "tag":"(0008,1125)",
        "name":"Referenced Visit Sequence",
        "keyword":"ReferencedVisitSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081130":{
        "tag":"(0008,1130)",
        "name":"Referenced Overlay Sequence",
        "keyword":"ReferencedOverlaySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00081134":{
        "tag":"(0008,1134)",
        "name":"Referenced Stereometric Instance Sequence",
        "keyword":"ReferencedStereometricInstanceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0008113A":{
        "tag":"(0008,113A)",
        "name":"Referenced Waveform Sequence",
        "keyword":"ReferencedWaveformSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081140":{
        "tag":"(0008,1140)",
        "name":"Referenced Image Sequence",
        "keyword":"ReferencedImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081145":{
        "tag":"(0008,1145)",
        "name":"Referenced Curve Sequence",
        "keyword":"ReferencedCurveSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0008114A":{
        "tag":"(0008,114A)",
        "name":"Referenced Instance Sequence",
        "keyword":"ReferencedInstanceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0008114B":{
        "tag":"(0008,114B)",
        "name":"Referenced Real World Value Mapping Instance Sequence",
        "keyword":"ReferencedRealWorldValueMappingInstanceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081150":{
        "tag":"(0008,1150)",
        "name":"Referenced SOP Class UID",
        "keyword":"ReferencedSOPClassUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00081155":{
        "tag":"(0008,1155)",
        "name":"Referenced SOP Instance UID",
        "keyword":"ReferencedSOPInstanceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0008115A":{
        "tag":"(0008,115A)",
        "name":"SOP Classes Supported",
        "keyword":"SOPClassesSupported",
        "vr":"UI",
        "vm":"1-n",
        "retired":false
    },
    "00081160":{
        "tag":"(0008,1160)",
        "name":"Referenced Frame Number",
        "keyword":"ReferencedFrameNumber",
        "vr":"IS",
        "vm":"1-n",
        "retired":false
    },
    "00081161":{
        "tag":"(0008,1161)",
        "name":"Simple Frame List",
        "keyword":"SimpleFrameList",
        "vr":"UL",
        "vm":"1-n",
        "retired":false
    },
    "00081162":{
        "tag":"(0008,1162)",
        "name":"Calculated Frame List",
        "keyword":"CalculatedFrameList",
        "vr":"UL",
        "vm":"3-3n",
        "retired":false
    },
    "00081163":{
        "tag":"(0008,1163)",
        "name":"Time Range",
        "keyword":"TimeRange",
        "vr":"FD",
        "vm":"2",
        "retired":false
    },
    "00081164":{
        "tag":"(0008,1164)",
        "name":"Frame Extraction Sequence",
        "keyword":"FrameExtractionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081167":{
        "tag":"(0008,1167)",
        "name":"Multi-frame Source SOP Instance UID",
        "keyword":"MultiFrameSourceSOPInstanceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00081190":{
        "tag":"(0008,1190)",
        "name":"Retrieve URL",
        "keyword":"RetrieveURL",
        "vr":"UR",
        "vm":"1",
        "retired":false
    },
    "00081195":{
        "tag":"(0008,1195)",
        "name":"Transaction UID",
        "keyword":"TransactionUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00081196":{
        "tag":"(0008,1196)",
        "name":"Warning Reason",
        "keyword":"WarningReason",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00081197":{
        "tag":"(0008,1197)",
        "name":"Failure Reason",
        "keyword":"FailureReason",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00081198":{
        "tag":"(0008,1198)",
        "name":"Failed SOP Sequence",
        "keyword":"FailedSOPSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081199":{
        "tag":"(0008,1199)",
        "name":"Referenced SOP Sequence",
        "keyword":"ReferencedSOPSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0008119A":{
        "tag":"(0008,119A)",
        "name":"Other Failures Sequence",
        "keyword":"OtherFailuresSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081200":{
        "tag":"(0008,1200)",
        "name":"Studies Containing Other Referenced Instances Sequence",
        "keyword":"StudiesContainingOtherReferencedInstancesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00081250":{
        "tag":"(0008,1250)",
        "name":"Related Series Sequence",
        "keyword":"RelatedSeriesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00082110":{
        "tag":"(0008,2110)",
        "name":"Lossy Image Compression (Retired)",
        "keyword":"LossyImageCompressionRetired",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00082111":{
        "tag":"(0008,2111)",
        "name":"Derivation Description",
        "keyword":"DerivationDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00082112":{
        "tag":"(0008,2112)",
        "name":"Source Image Sequence",
        "keyword":"SourceImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00082120":{
        "tag":"(0008,2120)",
        "name":"Stage Name",
        "keyword":"StageName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00082122":{
        "tag":"(0008,2122)",
        "name":"Stage Number",
        "keyword":"StageNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00082124":{
        "tag":"(0008,2124)",
        "name":"Number of Stages",
        "keyword":"NumberOfStages",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00082127":{
        "tag":"(0008,2127)",
        "name":"View Name",
        "keyword":"ViewName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00082128":{
        "tag":"(0008,2128)",
        "name":"View Number",
        "keyword":"ViewNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00082129":{
        "tag":"(0008,2129)",
        "name":"Number of Event Timers",
        "keyword":"NumberOfEventTimers",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "0008212A":{
        "tag":"(0008,212A)",
        "name":"Number of Views in Stage",
        "keyword":"NumberOfViewsInStage",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00082130":{
        "tag":"(0008,2130)",
        "name":"Event Elapsed Time(s)",
        "keyword":"EventElapsedTimes",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00082132":{
        "tag":"(0008,2132)",
        "name":"Event Timer Name(s)",
        "keyword":"EventTimerNames",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00082133":{
        "tag":"(0008,2133)",
        "name":"Event Timer Sequence",
        "keyword":"EventTimerSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00082134":{
        "tag":"(0008,2134)",
        "name":"Event Time Offset",
        "keyword":"EventTimeOffset",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00082135":{
        "tag":"(0008,2135)",
        "name":"Event Code Sequence",
        "keyword":"EventCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00082142":{
        "tag":"(0008,2142)",
        "name":"Start Trim",
        "keyword":"StartTrim",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00082143":{
        "tag":"(0008,2143)",
        "name":"Stop Trim",
        "keyword":"StopTrim",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00082144":{
        "tag":"(0008,2144)",
        "name":"Recommended Display Frame Rate",
        "keyword":"RecommendedDisplayFrameRate",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00082200":{
        "tag":"(0008,2200)",
        "name":"Transducer Position",
        "keyword":"TransducerPosition",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00082204":{
        "tag":"(0008,2204)",
        "name":"Transducer Orientation",
        "keyword":"TransducerOrientation",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00082208":{
        "tag":"(0008,2208)",
        "name":"Anatomic Structure",
        "keyword":"AnatomicStructure",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00082218":{
        "tag":"(0008,2218)",
        "name":"Anatomic Region Sequence",
        "keyword":"AnatomicRegionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00082220":{
        "tag":"(0008,2220)",
        "name":"Anatomic Region Modifier Sequence",
        "keyword":"AnatomicRegionModifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00082228":{
        "tag":"(0008,2228)",
        "name":"Primary Anatomic Structure Sequence",
        "keyword":"PrimaryAnatomicStructureSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00082229":{
        "tag":"(0008,2229)",
        "name":"Anatomic Structure, Space or Region Sequence",
        "keyword":"AnatomicStructureSpaceOrRegionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00082230":{
        "tag":"(0008,2230)",
        "name":"Primary Anatomic Structure Modifier Sequence",
        "keyword":"PrimaryAnatomicStructureModifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00082240":{
        "tag":"(0008,2240)",
        "name":"Transducer Position Sequence",
        "keyword":"TransducerPositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00082242":{
        "tag":"(0008,2242)",
        "name":"Transducer Position Modifier Sequence",
        "keyword":"TransducerPositionModifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00082244":{
        "tag":"(0008,2244)",
        "name":"Transducer Orientation Sequence",
        "keyword":"TransducerOrientationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00082246":{
        "tag":"(0008,2246)",
        "name":"Transducer Orientation Modifier Sequence",
        "keyword":"TransducerOrientationModifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00082251":{
        "tag":"(0008,2251)",
        "name":"Anatomic Structure Space Or Region Code Sequence (Trial)",
        "keyword":"AnatomicStructureSpaceOrRegionCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00082253":{
        "tag":"(0008,2253)",
        "name":"Anatomic Portal Of Entrance Code Sequence (Trial)",
        "keyword":"AnatomicPortalOfEntranceCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00082255":{
        "tag":"(0008,2255)",
        "name":"Anatomic Approach Direction Code Sequence (Trial)",
        "keyword":"AnatomicApproachDirectionCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00082256":{
        "tag":"(0008,2256)",
        "name":"Anatomic Perspective Description (Trial)",
        "keyword":"AnatomicPerspectiveDescriptionTrial",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "00082257":{
        "tag":"(0008,2257)",
        "name":"Anatomic Perspective Code Sequence (Trial)",
        "keyword":"AnatomicPerspectiveCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00082258":{
        "tag":"(0008,2258)",
        "name":"Anatomic Location Of Examining Instrument Description (Trial)",
        "keyword":"AnatomicLocationOfExaminingInstrumentDescriptionTrial",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "00082259":{
        "tag":"(0008,2259)",
        "name":"Anatomic Location Of Examining Instrument Code Sequence (Trial)",
        "keyword":"AnatomicLocationOfExaminingInstrumentCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0008225A":{
        "tag":"(0008,225A)",
        "name":"Anatomic Structure Space Or Region Modifier Code Sequence (Trial)",
        "keyword":"AnatomicStructureSpaceOrRegionModifierCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0008225C":{
        "tag":"(0008,225C)",
        "name":"On Axis Background Anatomic Structure Code Sequence (Trial)",
        "keyword":"OnAxisBackgroundAnatomicStructureCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00083001":{
        "tag":"(0008,3001)",
        "name":"Alternate Representation Sequence",
        "keyword":"AlternateRepresentationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00083010":{
        "tag":"(0008,3010)",
        "name":"Irradiation Event UID",
        "keyword":"IrradiationEventUID",
        "vr":"UI",
        "vm":"1-n",
        "retired":false
    },
    "00083011":{
        "tag":"(0008,3011)",
        "name":"Source Irradiation Event Sequence",
        "keyword":"SourceIrradiationEventSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00083012":{
        "tag":"(0008,3012)",
        "name":"Radiopharmaceutical Administration Event UID",
        "keyword":"RadiopharmaceuticalAdministrationEventUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00084000":{
        "tag":"(0008,4000)",
        "name":"Identifying Comments",
        "keyword":"IdentifyingComments",
        "vr":"LT",
        "vm":"1",
        "retired":true
    },
    "00089007":{
        "tag":"(0008,9007)",
        "name":"Frame Type",
        "keyword":"FrameType",
        "vr":"CS",
        "vm":"4",
        "retired":false
    },
    "00089092":{
        "tag":"(0008,9092)",
        "name":"Referenced Image Evidence Sequence",
        "keyword":"ReferencedImageEvidenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00089121":{
        "tag":"(0008,9121)",
        "name":"Referenced Raw Data Sequence",
        "keyword":"ReferencedRawDataSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00089123":{
        "tag":"(0008,9123)",
        "name":"Creator-Version UID",
        "keyword":"CreatorVersionUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00089124":{
        "tag":"(0008,9124)",
        "name":"Derivation Image Sequence",
        "keyword":"DerivationImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00089154":{
        "tag":"(0008,9154)",
        "name":"Source Image Evidence Sequence",
        "keyword":"SourceImageEvidenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00089205":{
        "tag":"(0008,9205)",
        "name":"Pixel Presentation",
        "keyword":"PixelPresentation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00089206":{
        "tag":"(0008,9206)",
        "name":"Volumetric Properties",
        "keyword":"VolumetricProperties",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00089207":{
        "tag":"(0008,9207)",
        "name":"Volume Based Calculation Technique",
        "keyword":"VolumeBasedCalculationTechnique",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00089208":{
        "tag":"(0008,9208)",
        "name":"Complex Image Component",
        "keyword":"ComplexImageComponent",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00089209":{
        "tag":"(0008,9209)",
        "name":"Acquisition Contrast",
        "keyword":"AcquisitionContrast",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00089215":{
        "tag":"(0008,9215)",
        "name":"Derivation Code Sequence",
        "keyword":"DerivationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00089237":{
        "tag":"(0008,9237)",
        "name":"Referenced Presentation State Sequence",
        "keyword":"ReferencedPresentationStateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00089410":{
        "tag":"(0008,9410)",
        "name":"Referenced Other Plane Sequence",
        "keyword":"ReferencedOtherPlaneSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00089458":{
        "tag":"(0008,9458)",
        "name":"Frame Display Sequence",
        "keyword":"FrameDisplaySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00089459":{
        "tag":"(0008,9459)",
        "name":"Recommended Display Frame Rate in Float",
        "keyword":"RecommendedDisplayFrameRateInFloat",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00089460":{
        "tag":"(0008,9460)",
        "name":"Skip Frame Range Flag",
        "keyword":"SkipFrameRangeFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00100010":{
        "tag":"(0010,0010)",
        "name":"Patient's Name",
        "keyword":"PatientName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00100020":{
        "tag":"(0010,0020)",
        "name":"Patient ID",
        "keyword":"PatientID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00100021":{
        "tag":"(0010,0021)",
        "name":"Issuer of Patient ID",
        "keyword":"IssuerOfPatientID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00100022":{
        "tag":"(0010,0022)",
        "name":"Type of Patient ID",
        "keyword":"TypeOfPatientID",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00100024":{
        "tag":"(0010,0024)",
        "name":"Issuer of Patient ID Qualifiers Sequence",
        "keyword":"IssuerOfPatientIDQualifiersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00100026":{
        "tag":"(0010,0026)",
        "name":"Source Patient Group Identification Sequence",
        "keyword":"SourcePatientGroupIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00100027":{
        "tag":"(0010,0027)",
        "name":"Group of Patients Identification Sequence",
        "keyword":"GroupOfPatientsIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00100028":{
        "tag":"(0010,0028)",
        "name":"Subject Relative Position in Image",
        "keyword":"SubjectRelativePositionInImage",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00100030":{
        "tag":"(0010,0030)",
        "name":"Patient's Birth Date",
        "keyword":"PatientBirthDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00100032":{
        "tag":"(0010,0032)",
        "name":"Patient's Birth Time",
        "keyword":"PatientBirthTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00100033":{
        "tag":"(0010,0033)",
        "name":"Patient's Birth Date in Alternative Calendar",
        "keyword":"PatientBirthDateInAlternativeCalendar",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00100034":{
        "tag":"(0010,0034)",
        "name":"Patient's Death Date in Alternative Calendar",
        "keyword":"PatientDeathDateInAlternativeCalendar",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00100035":{
        "tag":"(0010,0035)",
        "name":"Patient's Alternative Calendar",
        "keyword":"PatientAlternativeCalendar",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00100040":{
        "tag":"(0010,0040)",
        "name":"Patient's Sex",
        "keyword":"PatientSex",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00100050":{
        "tag":"(0010,0050)",
        "name":"Patient's Insurance Plan Code Sequence",
        "keyword":"PatientInsurancePlanCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00100101":{
        "tag":"(0010,0101)",
        "name":"Patient's Primary Language Code Sequence",
        "keyword":"PatientPrimaryLanguageCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00100102":{
        "tag":"(0010,0102)",
        "name":"Patient's Primary Language Modifier Code Sequence",
        "keyword":"PatientPrimaryLanguageModifierCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00100200":{
        "tag":"(0010,0200)",
        "name":"Quality Control Subject",
        "keyword":"QualityControlSubject",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00100201":{
        "tag":"(0010,0201)",
        "name":"Quality Control Subject Type Code Sequence",
        "keyword":"QualityControlSubjectTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00100212":{
        "tag":"(0010,0212)",
        "name":"Strain Description",
        "keyword":"StrainDescription",
        "vr":"UC",
        "vm":"1",
        "retired":false
    },
    "00100213":{
        "tag":"(0010,0213)",
        "name":"Strain Nomenclature",
        "keyword":"StrainNomenclature",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00100214":{
        "tag":"(0010,0214)",
        "name":"Strain Stock Number",
        "keyword":"StrainStockNumber",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00100215":{
        "tag":"(0010,0215)",
        "name":"Strain Source Registry Code Sequence",
        "keyword":"StrainSourceRegistryCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00100216":{
        "tag":"(0010,0216)",
        "name":"Strain Stock Sequence",
        "keyword":"StrainStockSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00100217":{
        "tag":"(0010,0217)",
        "name":"Strain Source",
        "keyword":"StrainSource",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00100218":{
        "tag":"(0010,0218)",
        "name":"Strain Additional Information",
        "keyword":"StrainAdditionalInformation",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00100219":{
        "tag":"(0010,0219)",
        "name":"Strain Code Sequence",
        "keyword":"StrainCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00100221":{
        "tag":"(0010,0221)",
        "name":"Genetic Modifications Sequence",
        "keyword":"GeneticModificationsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00100222":{
        "tag":"(0010,0222)",
        "name":"Genetic Modifications Description",
        "keyword":"GeneticModificationsDescription",
        "vr":"UC",
        "vm":"1",
        "retired":false
    },
    "00100223":{
        "tag":"(0010,0223)",
        "name":"Genetic Modifications Nomenclature",
        "keyword":"GeneticModificationsNomenclature",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00100229":{
        "tag":"(0010,0229)",
        "name":"Genetic Modifications Code Sequence",
        "keyword":"GeneticModificationsCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00101000":{
        "tag":"(0010,1000)",
        "name":"Other Patient IDs",
        "keyword":"OtherPatientIDs",
        "vr":"LO",
        "vm":"1-n",
        "retired":true
    },
    "00101001":{
        "tag":"(0010,1001)",
        "name":"Other Patient Names",
        "keyword":"OtherPatientNames",
        "vr":"PN",
        "vm":"1-n",
        "retired":false
    },
    "00101002":{
        "tag":"(0010,1002)",
        "name":"Other Patient IDs Sequence",
        "keyword":"OtherPatientIDsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00101005":{
        "tag":"(0010,1005)",
        "name":"Patient's Birth Name",
        "keyword":"PatientBirthName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00101010":{
        "tag":"(0010,1010)",
        "name":"Patient's Age",
        "keyword":"PatientAge",
        "vr":"AS",
        "vm":"1",
        "retired":false
    },
    "00101020":{
        "tag":"(0010,1020)",
        "name":"Patient's Size",
        "keyword":"PatientSize",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00101021":{
        "tag":"(0010,1021)",
        "name":"Patient's Size Code Sequence",
        "keyword":"PatientSizeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00101022":{
        "tag":"(0010,1022)",
        "name":"Patient's Body Mass Index",
        "keyword":"PatientBodyMassIndex",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00101023":{
        "tag":"(0010,1023)",
        "name":"Measured AP Dimension",
        "keyword":"MeasuredAPDimension",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00101024":{
        "tag":"(0010,1024)",
        "name":"Measured Lateral Dimension",
        "keyword":"MeasuredLateralDimension",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00101030":{
        "tag":"(0010,1030)",
        "name":"Patient's Weight",
        "keyword":"PatientWeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00101040":{
        "tag":"(0010,1040)",
        "name":"Patient's Address",
        "keyword":"PatientAddress",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00101050":{
        "tag":"(0010,1050)",
        "name":"Insurance Plan Identification",
        "keyword":"InsurancePlanIdentification",
        "vr":"LO",
        "vm":"1-n",
        "retired":true
    },
    "00101060":{
        "tag":"(0010,1060)",
        "name":"Patient's Mother's Birth Name",
        "keyword":"PatientMotherBirthName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00101080":{
        "tag":"(0010,1080)",
        "name":"Military Rank",
        "keyword":"MilitaryRank",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00101081":{
        "tag":"(0010,1081)",
        "name":"Branch of Service",
        "keyword":"BranchOfService",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00101090":{
        "tag":"(0010,1090)",
        "name":"Medical Record Locator",
        "keyword":"MedicalRecordLocator",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00101100":{
        "tag":"(0010,1100)",
        "name":"Referenced Patient Photo Sequence",
        "keyword":"ReferencedPatientPhotoSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00102000":{
        "tag":"(0010,2000)",
        "name":"Medical Alerts",
        "keyword":"MedicalAlerts",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00102110":{
        "tag":"(0010,2110)",
        "name":"Allergies",
        "keyword":"Allergies",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00102150":{
        "tag":"(0010,2150)",
        "name":"Country of Residence",
        "keyword":"CountryOfResidence",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00102152":{
        "tag":"(0010,2152)",
        "name":"Region of Residence",
        "keyword":"RegionOfResidence",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00102154":{
        "tag":"(0010,2154)",
        "name":"Patient's Telephone Numbers",
        "keyword":"PatientTelephoneNumbers",
        "vr":"SH",
        "vm":"1-n",
        "retired":false
    },
    "00102155":{
        "tag":"(0010,2155)",
        "name":"Patient's Telecom Information",
        "keyword":"PatientTelecomInformation",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00102160":{
        "tag":"(0010,2160)",
        "name":"Ethnic Group",
        "keyword":"EthnicGroup",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00102180":{
        "tag":"(0010,2180)",
        "name":"Occupation",
        "keyword":"Occupation",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "001021A0":{
        "tag":"(0010,21A0)",
        "name":"Smoking Status",
        "keyword":"SmokingStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "001021B0":{
        "tag":"(0010,21B0)",
        "name":"Additional Patient History",
        "keyword":"AdditionalPatientHistory",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "001021C0":{
        "tag":"(0010,21C0)",
        "name":"Pregnancy Status",
        "keyword":"PregnancyStatus",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "001021D0":{
        "tag":"(0010,21D0)",
        "name":"Last Menstrual Date",
        "keyword":"LastMenstrualDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "001021F0":{
        "tag":"(0010,21F0)",
        "name":"Patient's Religious Preference",
        "keyword":"PatientReligiousPreference",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00102201":{
        "tag":"(0010,2201)",
        "name":"Patient Species Description",
        "keyword":"PatientSpeciesDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00102202":{
        "tag":"(0010,2202)",
        "name":"Patient Species Code Sequence",
        "keyword":"PatientSpeciesCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00102203":{
        "tag":"(0010,2203)",
        "name":"Patient's Sex Neutered",
        "keyword":"PatientSexNeutered",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00102210":{
        "tag":"(0010,2210)",
        "name":"Anatomical Orientation Type",
        "keyword":"AnatomicalOrientationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00102292":{
        "tag":"(0010,2292)",
        "name":"Patient Breed Description",
        "keyword":"PatientBreedDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00102293":{
        "tag":"(0010,2293)",
        "name":"Patient Breed Code Sequence",
        "keyword":"PatientBreedCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00102294":{
        "tag":"(0010,2294)",
        "name":"Breed Registration Sequence",
        "keyword":"BreedRegistrationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00102295":{
        "tag":"(0010,2295)",
        "name":"Breed Registration Number",
        "keyword":"BreedRegistrationNumber",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00102296":{
        "tag":"(0010,2296)",
        "name":"Breed Registry Code Sequence",
        "keyword":"BreedRegistryCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00102297":{
        "tag":"(0010,2297)",
        "name":"Responsible Person",
        "keyword":"ResponsiblePerson",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00102298":{
        "tag":"(0010,2298)",
        "name":"Responsible Person Role",
        "keyword":"ResponsiblePersonRole",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00102299":{
        "tag":"(0010,2299)",
        "name":"Responsible Organization",
        "keyword":"ResponsibleOrganization",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00104000":{
        "tag":"(0010,4000)",
        "name":"Patient Comments",
        "keyword":"PatientComments",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00109431":{
        "tag":"(0010,9431)",
        "name":"Examined Body Thickness",
        "keyword":"ExaminedBodyThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00120010":{
        "tag":"(0012,0010)",
        "name":"Clinical Trial Sponsor Name",
        "keyword":"ClinicalTrialSponsorName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120020":{
        "tag":"(0012,0020)",
        "name":"Clinical Trial Protocol ID",
        "keyword":"ClinicalTrialProtocolID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120021":{
        "tag":"(0012,0021)",
        "name":"Clinical Trial Protocol Name",
        "keyword":"ClinicalTrialProtocolName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120030":{
        "tag":"(0012,0030)",
        "name":"Clinical Trial Site ID",
        "keyword":"ClinicalTrialSiteID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120031":{
        "tag":"(0012,0031)",
        "name":"Clinical Trial Site Name",
        "keyword":"ClinicalTrialSiteName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120040":{
        "tag":"(0012,0040)",
        "name":"Clinical Trial Subject ID",
        "keyword":"ClinicalTrialSubjectID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120042":{
        "tag":"(0012,0042)",
        "name":"Clinical Trial Subject Reading ID",
        "keyword":"ClinicalTrialSubjectReadingID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120050":{
        "tag":"(0012,0050)",
        "name":"Clinical Trial Time Point ID",
        "keyword":"ClinicalTrialTimePointID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120051":{
        "tag":"(0012,0051)",
        "name":"Clinical Trial Time Point Description",
        "keyword":"ClinicalTrialTimePointDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00120052":{
        "tag":"(0012,0052)",
        "name":"Longitudinal Temporal Offset from Event",
        "keyword":"LongitudinalTemporalOffsetFromEvent",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00120053":{
        "tag":"(0012,0053)",
        "name":"Longitudinal Temporal Event Type",
        "keyword":"LongitudinalTemporalEventType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00120060":{
        "tag":"(0012,0060)",
        "name":"Clinical Trial Coordinating Center Name",
        "keyword":"ClinicalTrialCoordinatingCenterName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120062":{
        "tag":"(0012,0062)",
        "name":"Patient Identity Removed",
        "keyword":"PatientIdentityRemoved",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00120063":{
        "tag":"(0012,0063)",
        "name":"De-identification Method",
        "keyword":"DeidentificationMethod",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00120064":{
        "tag":"(0012,0064)",
        "name":"De-identification Method Code Sequence",
        "keyword":"DeidentificationMethodCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00120071":{
        "tag":"(0012,0071)",
        "name":"Clinical Trial Series ID",
        "keyword":"ClinicalTrialSeriesID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120072":{
        "tag":"(0012,0072)",
        "name":"Clinical Trial Series Description",
        "keyword":"ClinicalTrialSeriesDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120081":{
        "tag":"(0012,0081)",
        "name":"Clinical Trial Protocol Ethics Committee Name",
        "keyword":"ClinicalTrialProtocolEthicsCommitteeName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120082":{
        "tag":"(0012,0082)",
        "name":"Clinical Trial Protocol Ethics Committee Approval Number",
        "keyword":"ClinicalTrialProtocolEthicsCommitteeApprovalNumber",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00120083":{
        "tag":"(0012,0083)",
        "name":"Consent for Clinical Trial Use Sequence",
        "keyword":"ConsentForClinicalTrialUseSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00120084":{
        "tag":"(0012,0084)",
        "name":"Distribution Type",
        "keyword":"DistributionType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00120085":{
        "tag":"(0012,0085)",
        "name":"Consent for Distribution Flag",
        "keyword":"ConsentForDistributionFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00120086":{
        "tag":"(0012,0086)",
        "name":"Ethics Committee Approval Effectiveness Start Date",
        "keyword":"EthicsCommitteeApprovalEffectivenessStartDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00120087":{
        "tag":"(0012,0087)",
        "name":"Ethics Committee Approval Effectiveness End Date",
        "keyword":"EthicsCommitteeApprovalEffectivenessEndDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00140023":{
        "tag":"(0014,0023)",
        "name":"CAD File Format",
        "keyword":"CADFileFormat",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "00140024":{
        "tag":"(0014,0024)",
        "name":"Component Reference System",
        "keyword":"ComponentReferenceSystem",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "00140025":{
        "tag":"(0014,0025)",
        "name":"Component Manufacturing Procedure",
        "keyword":"ComponentManufacturingProcedure",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00140028":{
        "tag":"(0014,0028)",
        "name":"Component Manufacturer",
        "keyword":"ComponentManufacturer",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00140030":{
        "tag":"(0014,0030)",
        "name":"Material Thickness",
        "keyword":"MaterialThickness",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00140032":{
        "tag":"(0014,0032)",
        "name":"Material Pipe Diameter",
        "keyword":"MaterialPipeDiameter",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00140034":{
        "tag":"(0014,0034)",
        "name":"Material Isolation Diameter",
        "keyword":"MaterialIsolationDiameter",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00140042":{
        "tag":"(0014,0042)",
        "name":"Material Grade",
        "keyword":"MaterialGrade",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00140044":{
        "tag":"(0014,0044)",
        "name":"Material Properties Description",
        "keyword":"MaterialPropertiesDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00140045":{
        "tag":"(0014,0045)",
        "name":"Material Properties File Format (Retired)",
        "keyword":"MaterialPropertiesFileFormatRetired",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "00140046":{
        "tag":"(0014,0046)",
        "name":"Material Notes",
        "keyword":"MaterialNotes",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00140050":{
        "tag":"(0014,0050)",
        "name":"Component Shape",
        "keyword":"ComponentShape",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00140052":{
        "tag":"(0014,0052)",
        "name":"Curvature Type",
        "keyword":"CurvatureType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00140054":{
        "tag":"(0014,0054)",
        "name":"Outer Diameter",
        "keyword":"OuterDiameter",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00140056":{
        "tag":"(0014,0056)",
        "name":"Inner Diameter",
        "keyword":"InnerDiameter",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00140100":{
        "tag":"(0014,0100)",
        "name":"Component Welder IDs",
        "keyword":"ComponentWelderIDs",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00140101":{
        "tag":"(0014,0101)",
        "name":"Secondary Approval Status",
        "keyword":"SecondaryApprovalStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00140102":{
        "tag":"(0014,0102)",
        "name":"Secondary Review Date",
        "keyword":"SecondaryReviewDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00140103":{
        "tag":"(0014,0103)",
        "name":"Secondary Review Time",
        "keyword":"SecondaryReviewTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00140104":{
        "tag":"(0014,0104)",
        "name":"Secondary Reviewer Name",
        "keyword":"SecondaryReviewerName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00140105":{
        "tag":"(0014,0105)",
        "name":"Repair ID",
        "keyword":"RepairID",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00140106":{
        "tag":"(0014,0106)",
        "name":"Multiple Component Approval Sequence",
        "keyword":"MultipleComponentApprovalSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00140107":{
        "tag":"(0014,0107)",
        "name":"Other Approval Status",
        "keyword":"OtherApprovalStatus",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00140108":{
        "tag":"(0014,0108)",
        "name":"Other Secondary Approval Status",
        "keyword":"OtherSecondaryApprovalStatus",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00141010":{
        "tag":"(0014,1010)",
        "name":"Actual Environmental Conditions",
        "keyword":"ActualEnvironmentalConditions",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00141020":{
        "tag":"(0014,1020)",
        "name":"Expiry Date",
        "keyword":"ExpiryDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00141040":{
        "tag":"(0014,1040)",
        "name":"Environmental Conditions",
        "keyword":"EnvironmentalConditions",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00142002":{
        "tag":"(0014,2002)",
        "name":"Evaluator Sequence",
        "keyword":"EvaluatorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00142004":{
        "tag":"(0014,2004)",
        "name":"Evaluator Number",
        "keyword":"EvaluatorNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00142006":{
        "tag":"(0014,2006)",
        "name":"Evaluator Name",
        "keyword":"EvaluatorName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00142008":{
        "tag":"(0014,2008)",
        "name":"Evaluation Attempt",
        "keyword":"EvaluationAttempt",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00142012":{
        "tag":"(0014,2012)",
        "name":"Indication Sequence",
        "keyword":"IndicationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00142014":{
        "tag":"(0014,2014)",
        "name":"Indication Number",
        "keyword":"IndicationNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00142016":{
        "tag":"(0014,2016)",
        "name":"Indication Label",
        "keyword":"IndicationLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00142018":{
        "tag":"(0014,2018)",
        "name":"Indication Description",
        "keyword":"IndicationDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "0014201A":{
        "tag":"(0014,201A)",
        "name":"Indication Type",
        "keyword":"IndicationType",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "0014201C":{
        "tag":"(0014,201C)",
        "name":"Indication Disposition",
        "keyword":"IndicationDisposition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0014201E":{
        "tag":"(0014,201E)",
        "name":"Indication ROI Sequence",
        "keyword":"IndicationROISequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00142030":{
        "tag":"(0014,2030)",
        "name":"Indication Physical Property Sequence",
        "keyword":"IndicationPhysicalPropertySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00142032":{
        "tag":"(0014,2032)",
        "name":"Property Label",
        "keyword":"PropertyLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00142202":{
        "tag":"(0014,2202)",
        "name":"Coordinate System Number of Axes",
        "keyword":"CoordinateSystemNumberOfAxes",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00142204":{
        "tag":"(0014,2204)",
        "name":"Coordinate System Axes Sequence",
        "keyword":"CoordinateSystemAxesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00142206":{
        "tag":"(0014,2206)",
        "name":"Coordinate System Axis Description",
        "keyword":"CoordinateSystemAxisDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00142208":{
        "tag":"(0014,2208)",
        "name":"Coordinate System Data Set Mapping",
        "keyword":"CoordinateSystemDataSetMapping",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0014220A":{
        "tag":"(0014,220A)",
        "name":"Coordinate System Axis Number",
        "keyword":"CoordinateSystemAxisNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "0014220C":{
        "tag":"(0014,220C)",
        "name":"Coordinate System Axis Type",
        "keyword":"CoordinateSystemAxisType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0014220E":{
        "tag":"(0014,220E)",
        "name":"Coordinate System Axis Units",
        "keyword":"CoordinateSystemAxisUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00142210":{
        "tag":"(0014,2210)",
        "name":"Coordinate System Axis Values",
        "keyword":"CoordinateSystemAxisValues",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "00142220":{
        "tag":"(0014,2220)",
        "name":"Coordinate System Transform Sequence",
        "keyword":"CoordinateSystemTransformSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00142222":{
        "tag":"(0014,2222)",
        "name":"Transform Description",
        "keyword":"TransformDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00142224":{
        "tag":"(0014,2224)",
        "name":"Transform Number of Axes",
        "keyword":"TransformNumberOfAxes",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00142226":{
        "tag":"(0014,2226)",
        "name":"Transform Order of Axes",
        "keyword":"TransformOrderOfAxes",
        "vr":"IS",
        "vm":"1-n",
        "retired":false
    },
    "00142228":{
        "tag":"(0014,2228)",
        "name":"Transformed Axis Units",
        "keyword":"TransformedAxisUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0014222A":{
        "tag":"(0014,222A)",
        "name":"Coordinate System Transform Rotation and Scale Matrix",
        "keyword":"CoordinateSystemTransformRotationAndScaleMatrix",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "0014222C":{
        "tag":"(0014,222C)",
        "name":"Coordinate System Transform Translation Matrix",
        "keyword":"CoordinateSystemTransformTranslationMatrix",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00143011":{
        "tag":"(0014,3011)",
        "name":"Internal Detector Frame Time",
        "keyword":"InternalDetectorFrameTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00143012":{
        "tag":"(0014,3012)",
        "name":"Number of Frames Integrated",
        "keyword":"NumberOfFramesIntegrated",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00143020":{
        "tag":"(0014,3020)",
        "name":"Detector Temperature Sequence",
        "keyword":"DetectorTemperatureSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00143022":{
        "tag":"(0014,3022)",
        "name":"Sensor Name",
        "keyword":"SensorName",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00143024":{
        "tag":"(0014,3024)",
        "name":"Horizontal Offset of Sensor",
        "keyword":"HorizontalOffsetOfSensor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00143026":{
        "tag":"(0014,3026)",
        "name":"Vertical Offset of Sensor",
        "keyword":"VerticalOffsetOfSensor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00143028":{
        "tag":"(0014,3028)",
        "name":"Sensor Temperature",
        "keyword":"SensorTemperature",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00143040":{
        "tag":"(0014,3040)",
        "name":"Dark Current Sequence",
        "keyword":"DarkCurrentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00143050":{
        "tag":"(0014,3050)",
        "name":"Dark Current Counts",
        "keyword":"DarkCurrentCounts",
        "vr":"OB or OW",
        "vm":"1",
        "retired":false
    },
    "00143060":{
        "tag":"(0014,3060)",
        "name":"Gain Correction Reference Sequence",
        "keyword":"GainCorrectionReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00143070":{
        "tag":"(0014,3070)",
        "name":"Air Counts",
        "keyword":"AirCounts",
        "vr":"OB or OW",
        "vm":"1",
        "retired":false
    },
    "00143071":{
        "tag":"(0014,3071)",
        "name":"KV Used in Gain Calibration",
        "keyword":"KVUsedInGainCalibration",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00143072":{
        "tag":"(0014,3072)",
        "name":"MA Used in Gain Calibration",
        "keyword":"MAUsedInGainCalibration",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00143073":{
        "tag":"(0014,3073)",
        "name":"Number of Frames Used for Integration",
        "keyword":"NumberOfFramesUsedForIntegration",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00143074":{
        "tag":"(0014,3074)",
        "name":"Filter Material Used in Gain Calibration",
        "keyword":"FilterMaterialUsedInGainCalibration",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00143075":{
        "tag":"(0014,3075)",
        "name":"Filter Thickness Used in Gain Calibration",
        "keyword":"FilterThicknessUsedInGainCalibration",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00143076":{
        "tag":"(0014,3076)",
        "name":"Date of Gain Calibration",
        "keyword":"DateOfGainCalibration",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00143077":{
        "tag":"(0014,3077)",
        "name":"Time of Gain Calibration",
        "keyword":"TimeOfGainCalibration",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00143080":{
        "tag":"(0014,3080)",
        "name":"Bad Pixel Image",
        "keyword":"BadPixelImage",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "00143099":{
        "tag":"(0014,3099)",
        "name":"Calibration Notes",
        "keyword":"CalibrationNotes",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00144002":{
        "tag":"(0014,4002)",
        "name":"Pulser Equipment Sequence",
        "keyword":"PulserEquipmentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144004":{
        "tag":"(0014,4004)",
        "name":"Pulser Type",
        "keyword":"PulserType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00144006":{
        "tag":"(0014,4006)",
        "name":"Pulser Notes",
        "keyword":"PulserNotes",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00144008":{
        "tag":"(0014,4008)",
        "name":"Receiver Equipment Sequence",
        "keyword":"ReceiverEquipmentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0014400A":{
        "tag":"(0014,400A)",
        "name":"Amplifier Type",
        "keyword":"AmplifierType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0014400C":{
        "tag":"(0014,400C)",
        "name":"Receiver Notes",
        "keyword":"ReceiverNotes",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "0014400E":{
        "tag":"(0014,400E)",
        "name":"Pre-Amplifier Equipment Sequence",
        "keyword":"PreAmplifierEquipmentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0014400F":{
        "tag":"(0014,400F)",
        "name":"Pre-Amplifier Notes",
        "keyword":"PreAmplifierNotes",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00144010":{
        "tag":"(0014,4010)",
        "name":"Transmit Transducer Sequence",
        "keyword":"TransmitTransducerSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144011":{
        "tag":"(0014,4011)",
        "name":"Receive Transducer Sequence",
        "keyword":"ReceiveTransducerSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144012":{
        "tag":"(0014,4012)",
        "name":"Number of Elements",
        "keyword":"NumberOfElements",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00144013":{
        "tag":"(0014,4013)",
        "name":"Element Shape",
        "keyword":"ElementShape",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00144014":{
        "tag":"(0014,4014)",
        "name":"Element Dimension A",
        "keyword":"ElementDimensionA",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144015":{
        "tag":"(0014,4015)",
        "name":"Element Dimension B",
        "keyword":"ElementDimensionB",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144016":{
        "tag":"(0014,4016)",
        "name":"Element Pitch A",
        "keyword":"ElementPitchA",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144017":{
        "tag":"(0014,4017)",
        "name":"Measured Beam Dimension A",
        "keyword":"MeasuredBeamDimensionA",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144018":{
        "tag":"(0014,4018)",
        "name":"Measured Beam Dimension B",
        "keyword":"MeasuredBeamDimensionB",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144019":{
        "tag":"(0014,4019)",
        "name":"Location of Measured Beam Diameter",
        "keyword":"LocationOfMeasuredBeamDiameter",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014401A":{
        "tag":"(0014,401A)",
        "name":"Nominal Frequency",
        "keyword":"NominalFrequency",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014401B":{
        "tag":"(0014,401B)",
        "name":"Measured Center Frequency",
        "keyword":"MeasuredCenterFrequency",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014401C":{
        "tag":"(0014,401C)",
        "name":"Measured Bandwidth",
        "keyword":"MeasuredBandwidth",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014401D":{
        "tag":"(0014,401D)",
        "name":"Element Pitch B",
        "keyword":"ElementPitchB",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144020":{
        "tag":"(0014,4020)",
        "name":"Pulser Settings Sequence",
        "keyword":"PulserSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144022":{
        "tag":"(0014,4022)",
        "name":"Pulse Width",
        "keyword":"PulseWidth",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144024":{
        "tag":"(0014,4024)",
        "name":"Excitation Frequency",
        "keyword":"ExcitationFrequency",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144026":{
        "tag":"(0014,4026)",
        "name":"Modulation Type",
        "keyword":"ModulationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00144028":{
        "tag":"(0014,4028)",
        "name":"Damping",
        "keyword":"Damping",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144030":{
        "tag":"(0014,4030)",
        "name":"Receiver Settings Sequence",
        "keyword":"ReceiverSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144031":{
        "tag":"(0014,4031)",
        "name":"Acquired Soundpath Length",
        "keyword":"AcquiredSoundpathLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144032":{
        "tag":"(0014,4032)",
        "name":"Acquisition Compression Type",
        "keyword":"AcquisitionCompressionType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00144033":{
        "tag":"(0014,4033)",
        "name":"Acquisition Sample Size",
        "keyword":"AcquisitionSampleSize",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00144034":{
        "tag":"(0014,4034)",
        "name":"Rectifier Smoothing",
        "keyword":"RectifierSmoothing",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144035":{
        "tag":"(0014,4035)",
        "name":"DAC Sequence",
        "keyword":"DACSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144036":{
        "tag":"(0014,4036)",
        "name":"DAC Type",
        "keyword":"DACType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00144038":{
        "tag":"(0014,4038)",
        "name":"DAC Gain Points",
        "keyword":"DACGainPoints",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "0014403A":{
        "tag":"(0014,403A)",
        "name":"DAC Time Points",
        "keyword":"DACTimePoints",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "0014403C":{
        "tag":"(0014,403C)",
        "name":"DAC Amplitude",
        "keyword":"DACAmplitude",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00144040":{
        "tag":"(0014,4040)",
        "name":"Pre-Amplifier Settings Sequence",
        "keyword":"PreAmplifierSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144050":{
        "tag":"(0014,4050)",
        "name":"Transmit Transducer Settings Sequence",
        "keyword":"TransmitTransducerSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144051":{
        "tag":"(0014,4051)",
        "name":"Receive Transducer Settings Sequence",
        "keyword":"ReceiveTransducerSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144052":{
        "tag":"(0014,4052)",
        "name":"Incident Angle",
        "keyword":"IncidentAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144054":{
        "tag":"(0014,4054)",
        "name":"Coupling Technique",
        "keyword":"CouplingTechnique",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00144056":{
        "tag":"(0014,4056)",
        "name":"Coupling Medium",
        "keyword":"CouplingMedium",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00144057":{
        "tag":"(0014,4057)",
        "name":"Coupling Velocity",
        "keyword":"CouplingVelocity",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144058":{
        "tag":"(0014,4058)",
        "name":"Probe Center Location X",
        "keyword":"ProbeCenterLocationX",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144059":{
        "tag":"(0014,4059)",
        "name":"Probe Center Location Z",
        "keyword":"ProbeCenterLocationZ",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014405A":{
        "tag":"(0014,405A)",
        "name":"Sound Path Length",
        "keyword":"SoundPathLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014405C":{
        "tag":"(0014,405C)",
        "name":"Delay Law Identifier",
        "keyword":"DelayLawIdentifier",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00144060":{
        "tag":"(0014,4060)",
        "name":"Gate Settings Sequence",
        "keyword":"GateSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144062":{
        "tag":"(0014,4062)",
        "name":"Gate Threshold",
        "keyword":"GateThreshold",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144064":{
        "tag":"(0014,4064)",
        "name":"Velocity of Sound",
        "keyword":"VelocityOfSound",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144070":{
        "tag":"(0014,4070)",
        "name":"Calibration Settings Sequence",
        "keyword":"CalibrationSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144072":{
        "tag":"(0014,4072)",
        "name":"Calibration Procedure",
        "keyword":"CalibrationProcedure",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00144074":{
        "tag":"(0014,4074)",
        "name":"Procedure Version",
        "keyword":"ProcedureVersion",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00144076":{
        "tag":"(0014,4076)",
        "name":"Procedure Creation Date",
        "keyword":"ProcedureCreationDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00144078":{
        "tag":"(0014,4078)",
        "name":"Procedure Expiration Date",
        "keyword":"ProcedureExpirationDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "0014407A":{
        "tag":"(0014,407A)",
        "name":"Procedure Last Modified Date",
        "keyword":"ProcedureLastModifiedDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "0014407C":{
        "tag":"(0014,407C)",
        "name":"Calibration Time",
        "keyword":"CalibrationTime",
        "vr":"TM",
        "vm":"1-n",
        "retired":false
    },
    "0014407E":{
        "tag":"(0014,407E)",
        "name":"Calibration Date",
        "keyword":"CalibrationDate",
        "vr":"DA",
        "vm":"1-n",
        "retired":false
    },
    "00144080":{
        "tag":"(0014,4080)",
        "name":"Probe Drive Equipment Sequence",
        "keyword":"ProbeDriveEquipmentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144081":{
        "tag":"(0014,4081)",
        "name":"Drive Type",
        "keyword":"DriveType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00144082":{
        "tag":"(0014,4082)",
        "name":"Probe Drive Notes",
        "keyword":"ProbeDriveNotes",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00144083":{
        "tag":"(0014,4083)",
        "name":"Drive Probe Sequence",
        "keyword":"DriveProbeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144084":{
        "tag":"(0014,4084)",
        "name":"Probe Inductance",
        "keyword":"ProbeInductance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144085":{
        "tag":"(0014,4085)",
        "name":"Probe Resistance",
        "keyword":"ProbeResistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144086":{
        "tag":"(0014,4086)",
        "name":"Receive Probe Sequence",
        "keyword":"ReceiveProbeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144087":{
        "tag":"(0014,4087)",
        "name":"Probe Drive Settings Sequence",
        "keyword":"ProbeDriveSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144088":{
        "tag":"(0014,4088)",
        "name":"Bridge Resistors",
        "keyword":"BridgeResistors",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144089":{
        "tag":"(0014,4089)",
        "name":"Probe Orientation Angle",
        "keyword":"ProbeOrientationAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014408B":{
        "tag":"(0014,408B)",
        "name":"User Selected Gain Y",
        "keyword":"UserSelectedGainY",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014408C":{
        "tag":"(0014,408C)",
        "name":"User Selected Phase",
        "keyword":"UserSelectedPhase",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014408D":{
        "tag":"(0014,408D)",
        "name":"User Selected Offset X",
        "keyword":"UserSelectedOffsetX",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014408E":{
        "tag":"(0014,408E)",
        "name":"User Selected Offset Y",
        "keyword":"UserSelectedOffsetY",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00144091":{
        "tag":"(0014,4091)",
        "name":"Channel Settings Sequence",
        "keyword":"ChannelSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00144092":{
        "tag":"(0014,4092)",
        "name":"Channel Threshold",
        "keyword":"ChannelThreshold",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014409A":{
        "tag":"(0014,409A)",
        "name":"Scanner Settings Sequence",
        "keyword":"ScannerSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0014409B":{
        "tag":"(0014,409B)",
        "name":"Scan Procedure",
        "keyword":"ScanProcedure",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "0014409C":{
        "tag":"(0014,409C)",
        "name":"Translation Rate X",
        "keyword":"TranslationRateX",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014409D":{
        "tag":"(0014,409D)",
        "name":"Translation Rate Y",
        "keyword":"TranslationRateY",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014409F":{
        "tag":"(0014,409F)",
        "name":"Channel Overlap",
        "keyword":"ChannelOverlap",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "001440A0":{
        "tag":"(0014,40A0)",
        "name":"Image Quality Indicator Type",
        "keyword":"ImageQualityIndicatorType",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "001440A1":{
        "tag":"(0014,40A1)",
        "name":"Image Quality Indicator Material",
        "keyword":"ImageQualityIndicatorMaterial",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "001440A2":{
        "tag":"(0014,40A2)",
        "name":"Image Quality Indicator Size",
        "keyword":"ImageQualityIndicatorSize",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00145002":{
        "tag":"(0014,5002)",
        "name":"LINAC Energy",
        "keyword":"LINACEnergy",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00145004":{
        "tag":"(0014,5004)",
        "name":"LINAC Output",
        "keyword":"LINACOutput",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00145100":{
        "tag":"(0014,5100)",
        "name":"Active Aperture",
        "keyword":"ActiveAperture",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00145101":{
        "tag":"(0014,5101)",
        "name":"Total Aperture",
        "keyword":"TotalAperture",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145102":{
        "tag":"(0014,5102)",
        "name":"Aperture Elevation",
        "keyword":"ApertureElevation",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145103":{
        "tag":"(0014,5103)",
        "name":"Main Lobe Angle",
        "keyword":"MainLobeAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145104":{
        "tag":"(0014,5104)",
        "name":"Main Roof Angle",
        "keyword":"MainRoofAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145105":{
        "tag":"(0014,5105)",
        "name":"Connector Type",
        "keyword":"ConnectorType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00145106":{
        "tag":"(0014,5106)",
        "name":"Wedge Model Number",
        "keyword":"WedgeModelNumber",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00145107":{
        "tag":"(0014,5107)",
        "name":"Wedge Angle Float",
        "keyword":"WedgeAngleFloat",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145108":{
        "tag":"(0014,5108)",
        "name":"Wedge Roof Angle",
        "keyword":"WedgeRoofAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145109":{
        "tag":"(0014,5109)",
        "name":"Wedge Element 1 Position",
        "keyword":"WedgeElement1Position",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0014510A":{
        "tag":"(0014,510A)",
        "name":"Wedge Material Velocity",
        "keyword":"WedgeMaterialVelocity",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014510B":{
        "tag":"(0014,510B)",
        "name":"Wedge Material",
        "keyword":"WedgeMaterial",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "0014510C":{
        "tag":"(0014,510C)",
        "name":"Wedge Offset Z",
        "keyword":"WedgeOffsetZ",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014510D":{
        "tag":"(0014,510D)",
        "name":"Wedge Origin Offset X",
        "keyword":"WedgeOriginOffsetX",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014510E":{
        "tag":"(0014,510E)",
        "name":"Wedge Time Delay",
        "keyword":"WedgeTimeDelay",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014510F":{
        "tag":"(0014,510F)",
        "name":"Wedge Name",
        "keyword":"WedgeName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00145110":{
        "tag":"(0014,5110)",
        "name":"Wedge Manufacturer Name",
        "keyword":"WedgeManufacturerName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00145111":{
        "tag":"(0014,5111)",
        "name":"Wedge Description",
        "keyword":"WedgeDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00145112":{
        "tag":"(0014,5112)",
        "name":"Nominal Beam Angle",
        "keyword":"NominalBeamAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145113":{
        "tag":"(0014,5113)",
        "name":"Wedge Offset X",
        "keyword":"WedgeOffsetX",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145114":{
        "tag":"(0014,5114)",
        "name":"Wedge Offset Y",
        "keyword":"WedgeOffsetY",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145115":{
        "tag":"(0014,5115)",
        "name":"Wedge Total Length",
        "keyword":"WedgeTotalLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145116":{
        "tag":"(0014,5116)",
        "name":"Wedge In Contact Length",
        "keyword":"WedgeInContactLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145117":{
        "tag":"(0014,5117)",
        "name":"Wedge Front Gap",
        "keyword":"WedgeFrontGap",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145118":{
        "tag":"(0014,5118)",
        "name":"Wedge Total Height",
        "keyword":"WedgeTotalHeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00145119":{
        "tag":"(0014,5119)",
        "name":"Wedge Front Height",
        "keyword":"WedgeFrontHeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014511A":{
        "tag":"(0014,511A)",
        "name":"Wedge Rear Height",
        "keyword":"WedgeRearHeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014511B":{
        "tag":"(0014,511B)",
        "name":"Wedge Total Width",
        "keyword":"WedgeTotalWidth",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014511C":{
        "tag":"(0014,511C)",
        "name":"Wedge In Contact Width",
        "keyword":"WedgeInContactWidth",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014511D":{
        "tag":"(0014,511D)",
        "name":"Wedge Chamfer Height",
        "keyword":"WedgeChamferHeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0014511E":{
        "tag":"(0014,511E)",
        "name":"Wedge Curve",
        "keyword":"WedgeCurve",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0014511F":{
        "tag":"(0014,511F)",
        "name":"Radius Along the Wedge",
        "keyword":"RadiusAlongWedge",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180010":{
        "tag":"(0018,0010)",
        "name":"Contrast/Bolus Agent",
        "keyword":"ContrastBolusAgent",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00180012":{
        "tag":"(0018,0012)",
        "name":"Contrast/Bolus Agent Sequence",
        "keyword":"ContrastBolusAgentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00180013":{
        "tag":"(0018,0013)",
        "name":"Contrast/Bolus T1 Relaxivity",
        "keyword":"ContrastBolusT1Relaxivity",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00180014":{
        "tag":"(0018,0014)",
        "name":"Contrast/Bolus Administration Route Sequence",
        "keyword":"ContrastBolusAdministrationRouteSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00180015":{
        "tag":"(0018,0015)",
        "name":"Body Part Examined",
        "keyword":"BodyPartExamined",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00180020":{
        "tag":"(0018,0020)",
        "name":"Scanning Sequence",
        "keyword":"ScanningSequence",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00180021":{
        "tag":"(0018,0021)",
        "name":"Sequence Variant",
        "keyword":"SequenceVariant",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00180022":{
        "tag":"(0018,0022)",
        "name":"Scan Options",
        "keyword":"ScanOptions",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00180023":{
        "tag":"(0018,0023)",
        "name":"MR Acquisition Type",
        "keyword":"MRAcquisitionType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00180024":{
        "tag":"(0018,0024)",
        "name":"Sequence Name",
        "keyword":"SequenceName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00180025":{
        "tag":"(0018,0025)",
        "name":"Angio Flag",
        "keyword":"AngioFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00180026":{
        "tag":"(0018,0026)",
        "name":"Intervention Drug Information Sequence",
        "keyword":"InterventionDrugInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00180027":{
        "tag":"(0018,0027)",
        "name":"Intervention Drug Stop Time",
        "keyword":"InterventionDrugStopTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00180028":{
        "tag":"(0018,0028)",
        "name":"Intervention Drug Dose",
        "keyword":"InterventionDrugDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180029":{
        "tag":"(0018,0029)",
        "name":"Intervention Drug Code Sequence",
        "keyword":"InterventionDrugCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018002A":{
        "tag":"(0018,002A)",
        "name":"Additional Drug Sequence",
        "keyword":"AdditionalDrugSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00180030":{
        "tag":"(0018,0030)",
        "name":"Radionuclide",
        "keyword":"Radionuclide",
        "vr":"LO",
        "vm":"1-n",
        "retired":true
    },
    "00180031":{
        "tag":"(0018,0031)",
        "name":"Radiopharmaceutical",
        "keyword":"Radiopharmaceutical",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00180032":{
        "tag":"(0018,0032)",
        "name":"Energy Window Centerline",
        "keyword":"EnergyWindowCenterline",
        "vr":"DS",
        "vm":"1",
        "retired":true
    },
    "00180033":{
        "tag":"(0018,0033)",
        "name":"Energy Window Total Width",
        "keyword":"EnergyWindowTotalWidth",
        "vr":"DS",
        "vm":"1-n",
        "retired":true
    },
    "00180034":{
        "tag":"(0018,0034)",
        "name":"Intervention Drug Name",
        "keyword":"InterventionDrugName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00180035":{
        "tag":"(0018,0035)",
        "name":"Intervention Drug Start Time",
        "keyword":"InterventionDrugStartTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00180036":{
        "tag":"(0018,0036)",
        "name":"Intervention Sequence",
        "keyword":"InterventionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00180037":{
        "tag":"(0018,0037)",
        "name":"Therapy Type",
        "keyword":"TherapyType",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00180038":{
        "tag":"(0018,0038)",
        "name":"Intervention Status",
        "keyword":"InterventionStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00180039":{
        "tag":"(0018,0039)",
        "name":"Therapy Description",
        "keyword":"TherapyDescription",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0018003A":{
        "tag":"(0018,003A)",
        "name":"Intervention Description",
        "keyword":"InterventionDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00180040":{
        "tag":"(0018,0040)",
        "name":"Cine Rate",
        "keyword":"CineRate",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00180042":{
        "tag":"(0018,0042)",
        "name":"Initial Cine Run State",
        "keyword":"InitialCineRunState",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00180050":{
        "tag":"(0018,0050)",
        "name":"Slice Thickness",
        "keyword":"SliceThickness",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180060":{
        "tag":"(0018,0060)",
        "name":"KVP",
        "keyword":"KVP",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180061":{
        "tag":"(0018,0061)",
        "name":"",
        "keyword":"",
        "vr":"DS",
        "vm":"1",
        "retired":true
    },
    "00180070":{
        "tag":"(0018,0070)",
        "name":"Counts Accumulated",
        "keyword":"CountsAccumulated",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00180071":{
        "tag":"(0018,0071)",
        "name":"Acquisition Termination Condition",
        "keyword":"AcquisitionTerminationCondition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00180072":{
        "tag":"(0018,0072)",
        "name":"Effective Duration",
        "keyword":"EffectiveDuration",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180073":{
        "tag":"(0018,0073)",
        "name":"Acquisition Start Condition",
        "keyword":"AcquisitionStartCondition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00180074":{
        "tag":"(0018,0074)",
        "name":"Acquisition Start Condition Data",
        "keyword":"AcquisitionStartConditionData",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00180075":{
        "tag":"(0018,0075)",
        "name":"Acquisition Termination Condition Data",
        "keyword":"AcquisitionTerminationConditionData",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00180080":{
        "tag":"(0018,0080)",
        "name":"Repetition Time",
        "keyword":"RepetitionTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180081":{
        "tag":"(0018,0081)",
        "name":"Echo Time",
        "keyword":"EchoTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180082":{
        "tag":"(0018,0082)",
        "name":"Inversion Time",
        "keyword":"InversionTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180083":{
        "tag":"(0018,0083)",
        "name":"Number of Averages",
        "keyword":"NumberOfAverages",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180084":{
        "tag":"(0018,0084)",
        "name":"Imaging Frequency",
        "keyword":"ImagingFrequency",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180085":{
        "tag":"(0018,0085)",
        "name":"Imaged Nucleus",
        "keyword":"ImagedNucleus",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00180086":{
        "tag":"(0018,0086)",
        "name":"Echo Number(s)",
        "keyword":"EchoNumbers",
        "vr":"IS",
        "vm":"1-n",
        "retired":false
    },
    "00180087":{
        "tag":"(0018,0087)",
        "name":"Magnetic Field Strength",
        "keyword":"MagneticFieldStrength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180088":{
        "tag":"(0018,0088)",
        "name":"Spacing Between Slices",
        "keyword":"SpacingBetweenSlices",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180089":{
        "tag":"(0018,0089)",
        "name":"Number of Phase Encoding Steps",
        "keyword":"NumberOfPhaseEncodingSteps",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00180090":{
        "tag":"(0018,0090)",
        "name":"Data Collection Diameter",
        "keyword":"DataCollectionDiameter",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180091":{
        "tag":"(0018,0091)",
        "name":"Echo Train Length",
        "keyword":"EchoTrainLength",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00180093":{
        "tag":"(0018,0093)",
        "name":"Percent Sampling",
        "keyword":"PercentSampling",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180094":{
        "tag":"(0018,0094)",
        "name":"Percent Phase Field of View",
        "keyword":"PercentPhaseFieldOfView",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00180095":{
        "tag":"(0018,0095)",
        "name":"Pixel Bandwidth",
        "keyword":"PixelBandwidth",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181000":{
        "tag":"(0018,1000)",
        "name":"Device Serial Number",
        "keyword":"DeviceSerialNumber",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181002":{
        "tag":"(0018,1002)",
        "name":"Device UID",
        "keyword":"DeviceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00181003":{
        "tag":"(0018,1003)",
        "name":"Device ID",
        "keyword":"DeviceID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181004":{
        "tag":"(0018,1004)",
        "name":"Plate ID",
        "keyword":"PlateID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181005":{
        "tag":"(0018,1005)",
        "name":"Generator ID",
        "keyword":"GeneratorID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181006":{
        "tag":"(0018,1006)",
        "name":"Grid ID",
        "keyword":"GridID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181007":{
        "tag":"(0018,1007)",
        "name":"Cassette ID",
        "keyword":"CassetteID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181008":{
        "tag":"(0018,1008)",
        "name":"Gantry ID",
        "keyword":"GantryID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181009":{
        "tag":"(0018,1009)",
        "name":"Unique Device Identifier",
        "keyword":"UniqueDeviceIdentifier",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "0018100A":{
        "tag":"(0018,100A)",
        "name":"UDI Sequence",
        "keyword":"UDISequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00181010":{
        "tag":"(0018,1010)",
        "name":"Secondary Capture Device ID",
        "keyword":"SecondaryCaptureDeviceID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181011":{
        "tag":"(0018,1011)",
        "name":"Hardcopy Creation Device ID",
        "keyword":"HardcopyCreationDeviceID",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00181012":{
        "tag":"(0018,1012)",
        "name":"Date of Secondary Capture",
        "keyword":"DateOfSecondaryCapture",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00181014":{
        "tag":"(0018,1014)",
        "name":"Time of Secondary Capture",
        "keyword":"TimeOfSecondaryCapture",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00181016":{
        "tag":"(0018,1016)",
        "name":"Secondary Capture Device Manufacturer",
        "keyword":"SecondaryCaptureDeviceManufacturer",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181017":{
        "tag":"(0018,1017)",
        "name":"Hardcopy Device Manufacturer",
        "keyword":"HardcopyDeviceManufacturer",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00181018":{
        "tag":"(0018,1018)",
        "name":"Secondary Capture Device Manufacturer's Model Name",
        "keyword":"SecondaryCaptureDeviceManufacturerModelName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181019":{
        "tag":"(0018,1019)",
        "name":"Secondary Capture Device Software Versions",
        "keyword":"SecondaryCaptureDeviceSoftwareVersions",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "0018101A":{
        "tag":"(0018,101A)",
        "name":"Hardcopy Device Software Version",
        "keyword":"HardcopyDeviceSoftwareVersion",
        "vr":"LO",
        "vm":"1-n",
        "retired":true
    },
    "0018101B":{
        "tag":"(0018,101B)",
        "name":"Hardcopy Device Manufacturer's Model Name",
        "keyword":"HardcopyDeviceManufacturerModelName",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00181020":{
        "tag":"(0018,1020)",
        "name":"Software Version(s)",
        "keyword":"SoftwareVersions",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00181022":{
        "tag":"(0018,1022)",
        "name":"Video Image Format Acquired",
        "keyword":"VideoImageFormatAcquired",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00181023":{
        "tag":"(0018,1023)",
        "name":"Digital Image Format Acquired",
        "keyword":"DigitalImageFormatAcquired",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181030":{
        "tag":"(0018,1030)",
        "name":"Protocol Name",
        "keyword":"ProtocolName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181040":{
        "tag":"(0018,1040)",
        "name":"Contrast/Bolus Route",
        "keyword":"ContrastBolusRoute",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181041":{
        "tag":"(0018,1041)",
        "name":"Contrast/Bolus Volume",
        "keyword":"ContrastBolusVolume",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181042":{
        "tag":"(0018,1042)",
        "name":"Contrast/Bolus Start Time",
        "keyword":"ContrastBolusStartTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00181043":{
        "tag":"(0018,1043)",
        "name":"Contrast/Bolus Stop Time",
        "keyword":"ContrastBolusStopTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00181044":{
        "tag":"(0018,1044)",
        "name":"Contrast/Bolus Total Dose",
        "keyword":"ContrastBolusTotalDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181045":{
        "tag":"(0018,1045)",
        "name":"Syringe Counts",
        "keyword":"SyringeCounts",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181046":{
        "tag":"(0018,1046)",
        "name":"Contrast Flow Rate",
        "keyword":"ContrastFlowRate",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00181047":{
        "tag":"(0018,1047)",
        "name":"Contrast Flow Duration",
        "keyword":"ContrastFlowDuration",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00181048":{
        "tag":"(0018,1048)",
        "name":"Contrast/Bolus Ingredient",
        "keyword":"ContrastBolusIngredient",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181049":{
        "tag":"(0018,1049)",
        "name":"Contrast/Bolus Ingredient Concentration",
        "keyword":"ContrastBolusIngredientConcentration",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181050":{
        "tag":"(0018,1050)",
        "name":"Spatial Resolution",
        "keyword":"SpatialResolution",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181060":{
        "tag":"(0018,1060)",
        "name":"Trigger Time",
        "keyword":"TriggerTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181061":{
        "tag":"(0018,1061)",
        "name":"Trigger Source or Type",
        "keyword":"TriggerSourceOrType",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181062":{
        "tag":"(0018,1062)",
        "name":"Nominal Interval",
        "keyword":"NominalInterval",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181063":{
        "tag":"(0018,1063)",
        "name":"Frame Time",
        "keyword":"FrameTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181064":{
        "tag":"(0018,1064)",
        "name":"Cardiac Framing Type",
        "keyword":"CardiacFramingType",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181065":{
        "tag":"(0018,1065)",
        "name":"Frame Time Vector",
        "keyword":"FrameTimeVector",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00181066":{
        "tag":"(0018,1066)",
        "name":"Frame Delay",
        "keyword":"FrameDelay",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181067":{
        "tag":"(0018,1067)",
        "name":"Image Trigger Delay",
        "keyword":"ImageTriggerDelay",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181068":{
        "tag":"(0018,1068)",
        "name":"Multiplex Group Time Offset",
        "keyword":"MultiplexGroupTimeOffset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181069":{
        "tag":"(0018,1069)",
        "name":"Trigger Time Offset",
        "keyword":"TriggerTimeOffset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0018106A":{
        "tag":"(0018,106A)",
        "name":"Synchronization Trigger",
        "keyword":"SynchronizationTrigger",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0018106C":{
        "tag":"(0018,106C)",
        "name":"Synchronization Channel",
        "keyword":"SynchronizationChannel",
        "vr":"US",
        "vm":"2",
        "retired":false
    },
    "0018106E":{
        "tag":"(0018,106E)",
        "name":"Trigger Sample Position",
        "keyword":"TriggerSamplePosition",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00181070":{
        "tag":"(0018,1070)",
        "name":"Radiopharmaceutical Route",
        "keyword":"RadiopharmaceuticalRoute",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181071":{
        "tag":"(0018,1071)",
        "name":"Radiopharmaceutical Volume",
        "keyword":"RadiopharmaceuticalVolume",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181072":{
        "tag":"(0018,1072)",
        "name":"Radiopharmaceutical Start Time",
        "keyword":"RadiopharmaceuticalStartTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00181073":{
        "tag":"(0018,1073)",
        "name":"Radiopharmaceutical Stop Time",
        "keyword":"RadiopharmaceuticalStopTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00181074":{
        "tag":"(0018,1074)",
        "name":"Radionuclide Total Dose",
        "keyword":"RadionuclideTotalDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181075":{
        "tag":"(0018,1075)",
        "name":"Radionuclide Half Life",
        "keyword":"RadionuclideHalfLife",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181076":{
        "tag":"(0018,1076)",
        "name":"Radionuclide Positron Fraction",
        "keyword":"RadionuclidePositronFraction",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181077":{
        "tag":"(0018,1077)",
        "name":"Radiopharmaceutical Specific Activity",
        "keyword":"RadiopharmaceuticalSpecificActivity",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181078":{
        "tag":"(0018,1078)",
        "name":"Radiopharmaceutical Start DateTime",
        "keyword":"RadiopharmaceuticalStartDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00181079":{
        "tag":"(0018,1079)",
        "name":"Radiopharmaceutical Stop DateTime",
        "keyword":"RadiopharmaceuticalStopDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00181080":{
        "tag":"(0018,1080)",
        "name":"Beat Rejection Flag",
        "keyword":"BeatRejectionFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181081":{
        "tag":"(0018,1081)",
        "name":"Low R-R Value",
        "keyword":"LowRRValue",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181082":{
        "tag":"(0018,1082)",
        "name":"High R-R Value",
        "keyword":"HighRRValue",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181083":{
        "tag":"(0018,1083)",
        "name":"Intervals Acquired",
        "keyword":"IntervalsAcquired",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181084":{
        "tag":"(0018,1084)",
        "name":"Intervals Rejected",
        "keyword":"IntervalsRejected",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181085":{
        "tag":"(0018,1085)",
        "name":"PVC Rejection",
        "keyword":"PVCRejection",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181086":{
        "tag":"(0018,1086)",
        "name":"Skip Beats",
        "keyword":"SkipBeats",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181088":{
        "tag":"(0018,1088)",
        "name":"Heart Rate",
        "keyword":"HeartRate",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181090":{
        "tag":"(0018,1090)",
        "name":"Cardiac Number of Images",
        "keyword":"CardiacNumberOfImages",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181094":{
        "tag":"(0018,1094)",
        "name":"Trigger Window",
        "keyword":"TriggerWindow",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181100":{
        "tag":"(0018,1100)",
        "name":"Reconstruction Diameter",
        "keyword":"ReconstructionDiameter",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181110":{
        "tag":"(0018,1110)",
        "name":"Distance Source to Detector",
        "keyword":"DistanceSourceToDetector",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181111":{
        "tag":"(0018,1111)",
        "name":"Distance Source to Patient",
        "keyword":"DistanceSourceToPatient",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181114":{
        "tag":"(0018,1114)",
        "name":"Estimated Radiographic Magnification Factor",
        "keyword":"EstimatedRadiographicMagnificationFactor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181120":{
        "tag":"(0018,1120)",
        "name":"Gantry/Detector Tilt",
        "keyword":"GantryDetectorTilt",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181121":{
        "tag":"(0018,1121)",
        "name":"Gantry/Detector Slew",
        "keyword":"GantryDetectorSlew",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181130":{
        "tag":"(0018,1130)",
        "name":"Table Height",
        "keyword":"TableHeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181131":{
        "tag":"(0018,1131)",
        "name":"Table Traverse",
        "keyword":"TableTraverse",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181134":{
        "tag":"(0018,1134)",
        "name":"Table Motion",
        "keyword":"TableMotion",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181135":{
        "tag":"(0018,1135)",
        "name":"Table Vertical Increment",
        "keyword":"TableVerticalIncrement",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00181136":{
        "tag":"(0018,1136)",
        "name":"Table Lateral Increment",
        "keyword":"TableLateralIncrement",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00181137":{
        "tag":"(0018,1137)",
        "name":"Table Longitudinal Increment",
        "keyword":"TableLongitudinalIncrement",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00181138":{
        "tag":"(0018,1138)",
        "name":"Table Angle",
        "keyword":"TableAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0018113A":{
        "tag":"(0018,113A)",
        "name":"Table Type",
        "keyword":"TableType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181140":{
        "tag":"(0018,1140)",
        "name":"Rotation Direction",
        "keyword":"RotationDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181141":{
        "tag":"(0018,1141)",
        "name":"Angular Position",
        "keyword":"AngularPosition",
        "vr":"DS",
        "vm":"1",
        "retired":true
    },
    "00181142":{
        "tag":"(0018,1142)",
        "name":"Radial Position",
        "keyword":"RadialPosition",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00181143":{
        "tag":"(0018,1143)",
        "name":"Scan Arc",
        "keyword":"ScanArc",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181144":{
        "tag":"(0018,1144)",
        "name":"Angular Step",
        "keyword":"AngularStep",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181145":{
        "tag":"(0018,1145)",
        "name":"Center of Rotation Offset",
        "keyword":"CenterOfRotationOffset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181146":{
        "tag":"(0018,1146)",
        "name":"Rotation Offset",
        "keyword":"RotationOffset",
        "vr":"DS",
        "vm":"1-n",
        "retired":true
    },
    "00181147":{
        "tag":"(0018,1147)",
        "name":"Field of View Shape",
        "keyword":"FieldOfViewShape",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181149":{
        "tag":"(0018,1149)",
        "name":"Field of View Dimension(s)",
        "keyword":"FieldOfViewDimensions",
        "vr":"IS",
        "vm":"1-2",
        "retired":false
    },
    "00181150":{
        "tag":"(0018,1150)",
        "name":"Exposure Time",
        "keyword":"ExposureTime",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181151":{
        "tag":"(0018,1151)",
        "name":"X-Ray Tube Current",
        "keyword":"XRayTubeCurrent",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181152":{
        "tag":"(0018,1152)",
        "name":"Exposure",
        "keyword":"Exposure",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181153":{
        "tag":"(0018,1153)",
        "name":"Exposure in \u00b5As",
        "keyword":"ExposureInuAs",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181154":{
        "tag":"(0018,1154)",
        "name":"Average Pulse Width",
        "keyword":"AveragePulseWidth",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181155":{
        "tag":"(0018,1155)",
        "name":"Radiation Setting",
        "keyword":"RadiationSetting",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181156":{
        "tag":"(0018,1156)",
        "name":"Rectification Type",
        "keyword":"RectificationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0018115A":{
        "tag":"(0018,115A)",
        "name":"Radiation Mode",
        "keyword":"RadiationMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0018115E":{
        "tag":"(0018,115E)",
        "name":"Image and Fluoroscopy Area Dose Product",
        "keyword":"ImageAndFluoroscopyAreaDoseProduct",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181160":{
        "tag":"(0018,1160)",
        "name":"Filter Type",
        "keyword":"FilterType",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00181161":{
        "tag":"(0018,1161)",
        "name":"Type of Filters",
        "keyword":"TypeOfFilters",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00181162":{
        "tag":"(0018,1162)",
        "name":"Intensifier Size",
        "keyword":"IntensifierSize",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181164":{
        "tag":"(0018,1164)",
        "name":"Imager Pixel Spacing",
        "keyword":"ImagerPixelSpacing",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "00181166":{
        "tag":"(0018,1166)",
        "name":"Grid",
        "keyword":"Grid",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00181170":{
        "tag":"(0018,1170)",
        "name":"Generator Power",
        "keyword":"GeneratorPower",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181180":{
        "tag":"(0018,1180)",
        "name":"Collimator/grid Name",
        "keyword":"CollimatorGridName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00181181":{
        "tag":"(0018,1181)",
        "name":"Collimator Type",
        "keyword":"CollimatorType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181182":{
        "tag":"(0018,1182)",
        "name":"Focal Distance",
        "keyword":"FocalDistance",
        "vr":"IS",
        "vm":"1-2",
        "retired":false
    },
    "00181183":{
        "tag":"(0018,1183)",
        "name":"X Focus Center",
        "keyword":"XFocusCenter",
        "vr":"DS",
        "vm":"1-2",
        "retired":false
    },
    "00181184":{
        "tag":"(0018,1184)",
        "name":"Y Focus Center",
        "keyword":"YFocusCenter",
        "vr":"DS",
        "vm":"1-2",
        "retired":false
    },
    "00181190":{
        "tag":"(0018,1190)",
        "name":"Focal Spot(s)",
        "keyword":"FocalSpots",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00181191":{
        "tag":"(0018,1191)",
        "name":"Anode Target Material",
        "keyword":"AnodeTargetMaterial",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "001811A0":{
        "tag":"(0018,11A0)",
        "name":"Body Part Thickness",
        "keyword":"BodyPartThickness",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "001811A2":{
        "tag":"(0018,11A2)",
        "name":"Compression Force",
        "keyword":"CompressionForce",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "001811A3":{
        "tag":"(0018,11A3)",
        "name":"Compression Pressure",
        "keyword":"CompressionPressure",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "001811A4":{
        "tag":"(0018,11A4)",
        "name":"Paddle Description",
        "keyword":"PaddleDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "001811A5":{
        "tag":"(0018,11A5)",
        "name":"Compression Contact Area",
        "keyword":"CompressionContactArea",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181200":{
        "tag":"(0018,1200)",
        "name":"Date of Last Calibration",
        "keyword":"DateOfLastCalibration",
        "vr":"DA",
        "vm":"1-n",
        "retired":false
    },
    "00181201":{
        "tag":"(0018,1201)",
        "name":"Time of Last Calibration",
        "keyword":"TimeOfLastCalibration",
        "vr":"TM",
        "vm":"1-n",
        "retired":false
    },
    "00181202":{
        "tag":"(0018,1202)",
        "name":"DateTime of Last Calibration",
        "keyword":"DateTimeOfLastCalibration",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00181210":{
        "tag":"(0018,1210)",
        "name":"Convolution Kernel",
        "keyword":"ConvolutionKernel",
        "vr":"SH",
        "vm":"1-n",
        "retired":false
    },
    "00181240":{
        "tag":"(0018,1240)",
        "name":"Upper/Lower Pixel Values",
        "keyword":"UpperLowerPixelValues",
        "vr":"IS",
        "vm":"1-n",
        "retired":true
    },
    "00181242":{
        "tag":"(0018,1242)",
        "name":"Actual Frame Duration",
        "keyword":"ActualFrameDuration",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181243":{
        "tag":"(0018,1243)",
        "name":"Count Rate",
        "keyword":"CountRate",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181244":{
        "tag":"(0018,1244)",
        "name":"Preferred Playback Sequencing",
        "keyword":"PreferredPlaybackSequencing",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00181250":{
        "tag":"(0018,1250)",
        "name":"Receive Coil Name",
        "keyword":"ReceiveCoilName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00181251":{
        "tag":"(0018,1251)",
        "name":"Transmit Coil Name",
        "keyword":"TransmitCoilName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00181260":{
        "tag":"(0018,1260)",
        "name":"Plate Type",
        "keyword":"PlateType",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00181261":{
        "tag":"(0018,1261)",
        "name":"Phosphor Type",
        "keyword":"PhosphorType",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181271":{
        "tag":"(0018,1271)",
        "name":"Water Equivalent Diameter",
        "keyword":"WaterEquivalentDiameter",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00181272":{
        "tag":"(0018,1272)",
        "name":"Water Equivalent Diameter Calculation Method Code Sequence",
        "keyword":"WaterEquivalentDiameterCalculationMethodCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00181300":{
        "tag":"(0018,1300)",
        "name":"Scan Velocity",
        "keyword":"ScanVelocity",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181301":{
        "tag":"(0018,1301)",
        "name":"Whole Body Technique",
        "keyword":"WholeBodyTechnique",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00181302":{
        "tag":"(0018,1302)",
        "name":"Scan Length",
        "keyword":"ScanLength",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181310":{
        "tag":"(0018,1310)",
        "name":"Acquisition Matrix",
        "keyword":"AcquisitionMatrix",
        "vr":"US",
        "vm":"4",
        "retired":false
    },
    "00181312":{
        "tag":"(0018,1312)",
        "name":"In-plane Phase Encoding Direction",
        "keyword":"InPlanePhaseEncodingDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181314":{
        "tag":"(0018,1314)",
        "name":"Flip Angle",
        "keyword":"FlipAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181315":{
        "tag":"(0018,1315)",
        "name":"Variable Flip Angle Flag",
        "keyword":"VariableFlipAngleFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181316":{
        "tag":"(0018,1316)",
        "name":"SAR",
        "keyword":"SAR",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181318":{
        "tag":"(0018,1318)",
        "name":"dB/dt",
        "keyword":"dBdt",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181320":{
        "tag":"(0018,1320)",
        "name":"B1rms",
        "keyword":"B1rms",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00181400":{
        "tag":"(0018,1400)",
        "name":"Acquisition Device Processing Description",
        "keyword":"AcquisitionDeviceProcessingDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181401":{
        "tag":"(0018,1401)",
        "name":"Acquisition Device Processing Code",
        "keyword":"AcquisitionDeviceProcessingCode",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00181402":{
        "tag":"(0018,1402)",
        "name":"Cassette Orientation",
        "keyword":"CassetteOrientation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181403":{
        "tag":"(0018,1403)",
        "name":"Cassette Size",
        "keyword":"CassetteSize",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181404":{
        "tag":"(0018,1404)",
        "name":"Exposures on Plate",
        "keyword":"ExposuresOnPlate",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00181405":{
        "tag":"(0018,1405)",
        "name":"Relative X-Ray Exposure",
        "keyword":"RelativeXRayExposure",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181411":{
        "tag":"(0018,1411)",
        "name":"Exposure Index",
        "keyword":"ExposureIndex",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181412":{
        "tag":"(0018,1412)",
        "name":"Target Exposure Index",
        "keyword":"TargetExposureIndex",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181413":{
        "tag":"(0018,1413)",
        "name":"Deviation Index",
        "keyword":"DeviationIndex",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181450":{
        "tag":"(0018,1450)",
        "name":"Column Angulation",
        "keyword":"ColumnAngulation",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181460":{
        "tag":"(0018,1460)",
        "name":"Tomo Layer Height",
        "keyword":"TomoLayerHeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181470":{
        "tag":"(0018,1470)",
        "name":"Tomo Angle",
        "keyword":"TomoAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181480":{
        "tag":"(0018,1480)",
        "name":"Tomo Time",
        "keyword":"TomoTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181490":{
        "tag":"(0018,1490)",
        "name":"Tomo Type",
        "keyword":"TomoType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181491":{
        "tag":"(0018,1491)",
        "name":"Tomo Class",
        "keyword":"TomoClass",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181495":{
        "tag":"(0018,1495)",
        "name":"Number of Tomosynthesis Source Images",
        "keyword":"NumberOfTomosynthesisSourceImages",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181500":{
        "tag":"(0018,1500)",
        "name":"Positioner Motion",
        "keyword":"PositionerMotion",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181508":{
        "tag":"(0018,1508)",
        "name":"Positioner Type",
        "keyword":"PositionerType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181510":{
        "tag":"(0018,1510)",
        "name":"Positioner Primary Angle",
        "keyword":"PositionerPrimaryAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181511":{
        "tag":"(0018,1511)",
        "name":"Positioner Secondary Angle",
        "keyword":"PositionerSecondaryAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181520":{
        "tag":"(0018,1520)",
        "name":"Positioner Primary Angle Increment",
        "keyword":"PositionerPrimaryAngleIncrement",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00181521":{
        "tag":"(0018,1521)",
        "name":"Positioner Secondary Angle Increment",
        "keyword":"PositionerSecondaryAngleIncrement",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00181530":{
        "tag":"(0018,1530)",
        "name":"Detector Primary Angle",
        "keyword":"DetectorPrimaryAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181531":{
        "tag":"(0018,1531)",
        "name":"Detector Secondary Angle",
        "keyword":"DetectorSecondaryAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00181600":{
        "tag":"(0018,1600)",
        "name":"Shutter Shape",
        "keyword":"ShutterShape",
        "vr":"CS",
        "vm":"1-3",
        "retired":false
    },
    "00181602":{
        "tag":"(0018,1602)",
        "name":"Shutter Left Vertical Edge",
        "keyword":"ShutterLeftVerticalEdge",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181604":{
        "tag":"(0018,1604)",
        "name":"Shutter Right Vertical Edge",
        "keyword":"ShutterRightVerticalEdge",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181606":{
        "tag":"(0018,1606)",
        "name":"Shutter Upper Horizontal Edge",
        "keyword":"ShutterUpperHorizontalEdge",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181608":{
        "tag":"(0018,1608)",
        "name":"Shutter Lower Horizontal Edge",
        "keyword":"ShutterLowerHorizontalEdge",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181610":{
        "tag":"(0018,1610)",
        "name":"Center of Circular Shutter",
        "keyword":"CenterOfCircularShutter",
        "vr":"IS",
        "vm":"2",
        "retired":false
    },
    "00181612":{
        "tag":"(0018,1612)",
        "name":"Radius of Circular Shutter",
        "keyword":"RadiusOfCircularShutter",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181620":{
        "tag":"(0018,1620)",
        "name":"Vertices of the Polygonal Shutter",
        "keyword":"VerticesOfThePolygonalShutter",
        "vr":"IS",
        "vm":"2-2n",
        "retired":false
    },
    "00181622":{
        "tag":"(0018,1622)",
        "name":"Shutter Presentation Value",
        "keyword":"ShutterPresentationValue",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00181623":{
        "tag":"(0018,1623)",
        "name":"Shutter Overlay Group",
        "keyword":"ShutterOverlayGroup",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00181624":{
        "tag":"(0018,1624)",
        "name":"Shutter Presentation Color CIELab Value",
        "keyword":"ShutterPresentationColorCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00181700":{
        "tag":"(0018,1700)",
        "name":"Collimator Shape",
        "keyword":"CollimatorShape",
        "vr":"CS",
        "vm":"1-3",
        "retired":false
    },
    "00181702":{
        "tag":"(0018,1702)",
        "name":"Collimator Left Vertical Edge",
        "keyword":"CollimatorLeftVerticalEdge",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181704":{
        "tag":"(0018,1704)",
        "name":"Collimator Right Vertical Edge",
        "keyword":"CollimatorRightVerticalEdge",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181706":{
        "tag":"(0018,1706)",
        "name":"Collimator Upper Horizontal Edge",
        "keyword":"CollimatorUpperHorizontalEdge",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181708":{
        "tag":"(0018,1708)",
        "name":"Collimator Lower Horizontal Edge",
        "keyword":"CollimatorLowerHorizontalEdge",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181710":{
        "tag":"(0018,1710)",
        "name":"Center of Circular Collimator",
        "keyword":"CenterOfCircularCollimator",
        "vr":"IS",
        "vm":"2",
        "retired":false
    },
    "00181712":{
        "tag":"(0018,1712)",
        "name":"Radius of Circular Collimator",
        "keyword":"RadiusOfCircularCollimator",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00181720":{
        "tag":"(0018,1720)",
        "name":"Vertices of the Polygonal Collimator",
        "keyword":"VerticesOfThePolygonalCollimator",
        "vr":"IS",
        "vm":"2-2n",
        "retired":false
    },
    "00181800":{
        "tag":"(0018,1800)",
        "name":"Acquisition Time Synchronized",
        "keyword":"AcquisitionTimeSynchronized",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181801":{
        "tag":"(0018,1801)",
        "name":"Time Source",
        "keyword":"TimeSource",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00181802":{
        "tag":"(0018,1802)",
        "name":"Time Distribution Protocol",
        "keyword":"TimeDistributionProtocol",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00181803":{
        "tag":"(0018,1803)",
        "name":"NTP Source Address",
        "keyword":"NTPSourceAddress",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00182001":{
        "tag":"(0018,2001)",
        "name":"Page Number Vector",
        "keyword":"PageNumberVector",
        "vr":"IS",
        "vm":"1-n",
        "retired":false
    },
    "00182002":{
        "tag":"(0018,2002)",
        "name":"Frame Label Vector",
        "keyword":"FrameLabelVector",
        "vr":"SH",
        "vm":"1-n",
        "retired":false
    },
    "00182003":{
        "tag":"(0018,2003)",
        "name":"Frame Primary Angle Vector",
        "keyword":"FramePrimaryAngleVector",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00182004":{
        "tag":"(0018,2004)",
        "name":"Frame Secondary Angle Vector",
        "keyword":"FrameSecondaryAngleVector",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00182005":{
        "tag":"(0018,2005)",
        "name":"Slice Location Vector",
        "keyword":"SliceLocationVector",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00182006":{
        "tag":"(0018,2006)",
        "name":"Display Window Label Vector",
        "keyword":"DisplayWindowLabelVector",
        "vr":"SH",
        "vm":"1-n",
        "retired":false
    },
    "00182010":{
        "tag":"(0018,2010)",
        "name":"Nominal Scanned Pixel Spacing",
        "keyword":"NominalScannedPixelSpacing",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "00182020":{
        "tag":"(0018,2020)",
        "name":"Digitizing Device Transport Direction",
        "keyword":"DigitizingDeviceTransportDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00182030":{
        "tag":"(0018,2030)",
        "name":"Rotation of Scanned Film",
        "keyword":"RotationOfScannedFilm",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00182041":{
        "tag":"(0018,2041)",
        "name":"Biopsy Target Sequence",
        "keyword":"BiopsyTargetSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00182042":{
        "tag":"(0018,2042)",
        "name":"Target UID",
        "keyword":"TargetUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00182043":{
        "tag":"(0018,2043)",
        "name":"Localizing Cursor Position",
        "keyword":"LocalizingCursorPosition",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00182044":{
        "tag":"(0018,2044)",
        "name":"Calculated Target Position",
        "keyword":"CalculatedTargetPosition",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "00182045":{
        "tag":"(0018,2045)",
        "name":"Target Label",
        "keyword":"TargetLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00182046":{
        "tag":"(0018,2046)",
        "name":"Displayed Z Value",
        "keyword":"DisplayedZValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00183100":{
        "tag":"(0018,3100)",
        "name":"IVUS Acquisition",
        "keyword":"IVUSAcquisition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00183101":{
        "tag":"(0018,3101)",
        "name":"IVUS Pullback Rate",
        "keyword":"IVUSPullbackRate",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00183102":{
        "tag":"(0018,3102)",
        "name":"IVUS Gated Rate",
        "keyword":"IVUSGatedRate",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00183103":{
        "tag":"(0018,3103)",
        "name":"IVUS Pullback Start Frame Number",
        "keyword":"IVUSPullbackStartFrameNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00183104":{
        "tag":"(0018,3104)",
        "name":"IVUS Pullback Stop Frame Number",
        "keyword":"IVUSPullbackStopFrameNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00183105":{
        "tag":"(0018,3105)",
        "name":"Lesion Number",
        "keyword":"LesionNumber",
        "vr":"IS",
        "vm":"1-n",
        "retired":false
    },
    "00184000":{
        "tag":"(0018,4000)",
        "name":"Acquisition Comments",
        "keyword":"AcquisitionComments",
        "vr":"LT",
        "vm":"1",
        "retired":true
    },
    "00185000":{
        "tag":"(0018,5000)",
        "name":"Output Power",
        "keyword":"OutputPower",
        "vr":"SH",
        "vm":"1-n",
        "retired":false
    },
    "00185010":{
        "tag":"(0018,5010)",
        "name":"Transducer Data",
        "keyword":"TransducerData",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00185012":{
        "tag":"(0018,5012)",
        "name":"Focus Depth",
        "keyword":"FocusDepth",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00185020":{
        "tag":"(0018,5020)",
        "name":"Processing Function",
        "keyword":"ProcessingFunction",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00185021":{
        "tag":"(0018,5021)",
        "name":"Postprocessing Function",
        "keyword":"PostprocessingFunction",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00185022":{
        "tag":"(0018,5022)",
        "name":"Mechanical Index",
        "keyword":"MechanicalIndex",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00185024":{
        "tag":"(0018,5024)",
        "name":"Bone Thermal Index",
        "keyword":"BoneThermalIndex",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00185026":{
        "tag":"(0018,5026)",
        "name":"Cranial Thermal Index",
        "keyword":"CranialThermalIndex",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00185027":{
        "tag":"(0018,5027)",
        "name":"Soft Tissue Thermal Index",
        "keyword":"SoftTissueThermalIndex",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00185028":{
        "tag":"(0018,5028)",
        "name":"Soft Tissue-focus Thermal Index",
        "keyword":"SoftTissueFocusThermalIndex",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00185029":{
        "tag":"(0018,5029)",
        "name":"Soft Tissue-surface Thermal Index",
        "keyword":"SoftTissueSurfaceThermalIndex",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00185030":{
        "tag":"(0018,5030)",
        "name":"Dynamic Range",
        "keyword":"DynamicRange",
        "vr":"DS",
        "vm":"1",
        "retired":true
    },
    "00185040":{
        "tag":"(0018,5040)",
        "name":"Total Gain",
        "keyword":"TotalGain",
        "vr":"DS",
        "vm":"1",
        "retired":true
    },
    "00185050":{
        "tag":"(0018,5050)",
        "name":"Depth of Scan Field",
        "keyword":"DepthOfScanField",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00185100":{
        "tag":"(0018,5100)",
        "name":"Patient Position",
        "keyword":"PatientPosition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00185101":{
        "tag":"(0018,5101)",
        "name":"View Position",
        "keyword":"ViewPosition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00185104":{
        "tag":"(0018,5104)",
        "name":"Projection Eponymous Name Code Sequence",
        "keyword":"ProjectionEponymousNameCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00185210":{
        "tag":"(0018,5210)",
        "name":"Image Transformation Matrix",
        "keyword":"ImageTransformationMatrix",
        "vr":"DS",
        "vm":"6",
        "retired":true
    },
    "00185212":{
        "tag":"(0018,5212)",
        "name":"Image Translation Vector",
        "keyword":"ImageTranslationVector",
        "vr":"DS",
        "vm":"3",
        "retired":true
    },
    "00186000":{
        "tag":"(0018,6000)",
        "name":"Sensitivity",
        "keyword":"Sensitivity",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00186011":{
        "tag":"(0018,6011)",
        "name":"Sequence of Ultrasound Regions",
        "keyword":"SequenceOfUltrasoundRegions",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00186012":{
        "tag":"(0018,6012)",
        "name":"Region Spatial Format",
        "keyword":"RegionSpatialFormat",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00186014":{
        "tag":"(0018,6014)",
        "name":"Region Data Type",
        "keyword":"RegionDataType",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00186016":{
        "tag":"(0018,6016)",
        "name":"Region Flags",
        "keyword":"RegionFlags",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00186018":{
        "tag":"(0018,6018)",
        "name":"Region Location Min X0",
        "keyword":"RegionLocationMinX0",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "0018601A":{
        "tag":"(0018,601A)",
        "name":"Region Location Min Y0",
        "keyword":"RegionLocationMinY0",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "0018601C":{
        "tag":"(0018,601C)",
        "name":"Region Location Max X1",
        "keyword":"RegionLocationMaxX1",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "0018601E":{
        "tag":"(0018,601E)",
        "name":"Region Location Max Y1",
        "keyword":"RegionLocationMaxY1",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00186020":{
        "tag":"(0018,6020)",
        "name":"Reference Pixel X0",
        "keyword":"ReferencePixelX0",
        "vr":"SL",
        "vm":"1",
        "retired":false
    },
    "00186022":{
        "tag":"(0018,6022)",
        "name":"Reference Pixel Y0",
        "keyword":"ReferencePixelY0",
        "vr":"SL",
        "vm":"1",
        "retired":false
    },
    "00186024":{
        "tag":"(0018,6024)",
        "name":"Physical Units X Direction",
        "keyword":"PhysicalUnitsXDirection",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00186026":{
        "tag":"(0018,6026)",
        "name":"Physical Units Y Direction",
        "keyword":"PhysicalUnitsYDirection",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00186028":{
        "tag":"(0018,6028)",
        "name":"Reference Pixel Physical Value X",
        "keyword":"ReferencePixelPhysicalValueX",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0018602A":{
        "tag":"(0018,602A)",
        "name":"Reference Pixel Physical Value Y",
        "keyword":"ReferencePixelPhysicalValueY",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0018602C":{
        "tag":"(0018,602C)",
        "name":"Physical Delta X",
        "keyword":"PhysicalDeltaX",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0018602E":{
        "tag":"(0018,602E)",
        "name":"Physical Delta Y",
        "keyword":"PhysicalDeltaY",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00186030":{
        "tag":"(0018,6030)",
        "name":"Transducer Frequency",
        "keyword":"TransducerFrequency",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00186031":{
        "tag":"(0018,6031)",
        "name":"Transducer Type",
        "keyword":"TransducerType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00186032":{
        "tag":"(0018,6032)",
        "name":"Pulse Repetition Frequency",
        "keyword":"PulseRepetitionFrequency",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00186034":{
        "tag":"(0018,6034)",
        "name":"Doppler Correction Angle",
        "keyword":"DopplerCorrectionAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00186036":{
        "tag":"(0018,6036)",
        "name":"Steering Angle",
        "keyword":"SteeringAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00186038":{
        "tag":"(0018,6038)",
        "name":"Doppler Sample Volume X Position (Retired)",
        "keyword":"DopplerSampleVolumeXPositionRetired",
        "vr":"UL",
        "vm":"1",
        "retired":true
    },
    "00186039":{
        "tag":"(0018,6039)",
        "name":"Doppler Sample Volume X Position",
        "keyword":"DopplerSampleVolumeXPosition",
        "vr":"SL",
        "vm":"1",
        "retired":false
    },
    "0018603A":{
        "tag":"(0018,603A)",
        "name":"Doppler Sample Volume Y Position (Retired)",
        "keyword":"DopplerSampleVolumeYPositionRetired",
        "vr":"UL",
        "vm":"1",
        "retired":true
    },
    "0018603B":{
        "tag":"(0018,603B)",
        "name":"Doppler Sample Volume Y Position",
        "keyword":"DopplerSampleVolumeYPosition",
        "vr":"SL",
        "vm":"1",
        "retired":false
    },
    "0018603C":{
        "tag":"(0018,603C)",
        "name":"TM-Line Position X0 (Retired)",
        "keyword":"TMLinePositionX0Retired",
        "vr":"UL",
        "vm":"1",
        "retired":true
    },
    "0018603D":{
        "tag":"(0018,603D)",
        "name":"TM-Line Position X0",
        "keyword":"TMLinePositionX0",
        "vr":"SL",
        "vm":"1",
        "retired":false
    },
    "0018603E":{
        "tag":"(0018,603E)",
        "name":"TM-Line Position Y0 (Retired)",
        "keyword":"TMLinePositionY0Retired",
        "vr":"UL",
        "vm":"1",
        "retired":true
    },
    "0018603F":{
        "tag":"(0018,603F)",
        "name":"TM-Line Position Y0",
        "keyword":"TMLinePositionY0",
        "vr":"SL",
        "vm":"1",
        "retired":false
    },
    "00186040":{
        "tag":"(0018,6040)",
        "name":"TM-Line Position X1 (Retired)",
        "keyword":"TMLinePositionX1Retired",
        "vr":"UL",
        "vm":"1",
        "retired":true
    },
    "00186041":{
        "tag":"(0018,6041)",
        "name":"TM-Line Position X1",
        "keyword":"TMLinePositionX1",
        "vr":"SL",
        "vm":"1",
        "retired":false
    },
    "00186042":{
        "tag":"(0018,6042)",
        "name":"TM-Line Position Y1 (Retired)",
        "keyword":"TMLinePositionY1Retired",
        "vr":"UL",
        "vm":"1",
        "retired":true
    },
    "00186043":{
        "tag":"(0018,6043)",
        "name":"TM-Line Position Y1",
        "keyword":"TMLinePositionY1",
        "vr":"SL",
        "vm":"1",
        "retired":false
    },
    "00186044":{
        "tag":"(0018,6044)",
        "name":"Pixel Component Organization",
        "keyword":"PixelComponentOrganization",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00186046":{
        "tag":"(0018,6046)",
        "name":"Pixel Component Mask",
        "keyword":"PixelComponentMask",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00186048":{
        "tag":"(0018,6048)",
        "name":"Pixel Component Range Start",
        "keyword":"PixelComponentRangeStart",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "0018604A":{
        "tag":"(0018,604A)",
        "name":"Pixel Component Range Stop",
        "keyword":"PixelComponentRangeStop",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "0018604C":{
        "tag":"(0018,604C)",
        "name":"Pixel Component Physical Units",
        "keyword":"PixelComponentPhysicalUnits",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "0018604E":{
        "tag":"(0018,604E)",
        "name":"Pixel Component Data Type",
        "keyword":"PixelComponentDataType",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00186050":{
        "tag":"(0018,6050)",
        "name":"Number of Table Break Points",
        "keyword":"NumberOfTableBreakPoints",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00186052":{
        "tag":"(0018,6052)",
        "name":"Table of X Break Points",
        "keyword":"TableOfXBreakPoints",
        "vr":"UL",
        "vm":"1-n",
        "retired":false
    },
    "00186054":{
        "tag":"(0018,6054)",
        "name":"Table of Y Break Points",
        "keyword":"TableOfYBreakPoints",
        "vr":"FD",
        "vm":"1-n",
        "retired":false
    },
    "00186056":{
        "tag":"(0018,6056)",
        "name":"Number of Table Entries",
        "keyword":"NumberOfTableEntries",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00186058":{
        "tag":"(0018,6058)",
        "name":"Table of Pixel Values",
        "keyword":"TableOfPixelValues",
        "vr":"UL",
        "vm":"1-n",
        "retired":false
    },
    "0018605A":{
        "tag":"(0018,605A)",
        "name":"Table of Parameter Values",
        "keyword":"TableOfParameterValues",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "00186060":{
        "tag":"(0018,6060)",
        "name":"R Wave Time Vector",
        "keyword":"RWaveTimeVector",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "00187000":{
        "tag":"(0018,7000)",
        "name":"Detector Conditions Nominal Flag",
        "keyword":"DetectorConditionsNominalFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00187001":{
        "tag":"(0018,7001)",
        "name":"Detector Temperature",
        "keyword":"DetectorTemperature",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00187004":{
        "tag":"(0018,7004)",
        "name":"Detector Type",
        "keyword":"DetectorType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00187005":{
        "tag":"(0018,7005)",
        "name":"Detector Configuration",
        "keyword":"DetectorConfiguration",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00187006":{
        "tag":"(0018,7006)",
        "name":"Detector Description",
        "keyword":"DetectorDescription",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00187008":{
        "tag":"(0018,7008)",
        "name":"Detector Mode",
        "keyword":"DetectorMode",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "0018700A":{
        "tag":"(0018,700A)",
        "name":"Detector ID",
        "keyword":"DetectorID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "0018700C":{
        "tag":"(0018,700C)",
        "name":"Date of Last Detector Calibration",
        "keyword":"DateOfLastDetectorCalibration",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "0018700E":{
        "tag":"(0018,700E)",
        "name":"Time of Last Detector Calibration",
        "keyword":"TimeOfLastDetectorCalibration",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00187010":{
        "tag":"(0018,7010)",
        "name":"Exposures on Detector Since Last Calibration",
        "keyword":"ExposuresOnDetectorSinceLastCalibration",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00187011":{
        "tag":"(0018,7011)",
        "name":"Exposures on Detector Since Manufactured",
        "keyword":"ExposuresOnDetectorSinceManufactured",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00187012":{
        "tag":"(0018,7012)",
        "name":"Detector Time Since Last Exposure",
        "keyword":"DetectorTimeSinceLastExposure",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00187014":{
        "tag":"(0018,7014)",
        "name":"Detector Active Time",
        "keyword":"DetectorActiveTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00187016":{
        "tag":"(0018,7016)",
        "name":"Detector Activation Offset From Exposure",
        "keyword":"DetectorActivationOffsetFromExposure",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0018701A":{
        "tag":"(0018,701A)",
        "name":"Detector Binning",
        "keyword":"DetectorBinning",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "00187020":{
        "tag":"(0018,7020)",
        "name":"Detector Element Physical Size",
        "keyword":"DetectorElementPhysicalSize",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "00187022":{
        "tag":"(0018,7022)",
        "name":"Detector Element Spacing",
        "keyword":"DetectorElementSpacing",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "00187024":{
        "tag":"(0018,7024)",
        "name":"Detector Active Shape",
        "keyword":"DetectorActiveShape",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00187026":{
        "tag":"(0018,7026)",
        "name":"Detector Active Dimension(s)",
        "keyword":"DetectorActiveDimensions",
        "vr":"DS",
        "vm":"1-2",
        "retired":false
    },
    "00187028":{
        "tag":"(0018,7028)",
        "name":"Detector Active Origin",
        "keyword":"DetectorActiveOrigin",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "0018702A":{
        "tag":"(0018,702A)",
        "name":"Detector Manufacturer Name",
        "keyword":"DetectorManufacturerName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0018702B":{
        "tag":"(0018,702B)",
        "name":"Detector Manufacturer's Model Name",
        "keyword":"DetectorManufacturerModelName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00187030":{
        "tag":"(0018,7030)",
        "name":"Field of View Origin",
        "keyword":"FieldOfViewOrigin",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "00187032":{
        "tag":"(0018,7032)",
        "name":"Field of View Rotation",
        "keyword":"FieldOfViewRotation",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00187034":{
        "tag":"(0018,7034)",
        "name":"Field of View Horizontal Flip",
        "keyword":"FieldOfViewHorizontalFlip",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00187036":{
        "tag":"(0018,7036)",
        "name":"Pixel Data Area Origin Relative To FOV",
        "keyword":"PixelDataAreaOriginRelativeToFOV",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00187038":{
        "tag":"(0018,7038)",
        "name":"Pixel Data Area Rotation Angle Relative To FOV",
        "keyword":"PixelDataAreaRotationAngleRelativeToFOV",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00187040":{
        "tag":"(0018,7040)",
        "name":"Grid Absorbing Material",
        "keyword":"GridAbsorbingMaterial",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00187041":{
        "tag":"(0018,7041)",
        "name":"Grid Spacing Material",
        "keyword":"GridSpacingMaterial",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00187042":{
        "tag":"(0018,7042)",
        "name":"Grid Thickness",
        "keyword":"GridThickness",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00187044":{
        "tag":"(0018,7044)",
        "name":"Grid Pitch",
        "keyword":"GridPitch",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00187046":{
        "tag":"(0018,7046)",
        "name":"Grid Aspect Ratio",
        "keyword":"GridAspectRatio",
        "vr":"IS",
        "vm":"2",
        "retired":false
    },
    "00187048":{
        "tag":"(0018,7048)",
        "name":"Grid Period",
        "keyword":"GridPeriod",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0018704C":{
        "tag":"(0018,704C)",
        "name":"Grid Focal Distance",
        "keyword":"GridFocalDistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00187050":{
        "tag":"(0018,7050)",
        "name":"Filter Material",
        "keyword":"FilterMaterial",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00187052":{
        "tag":"(0018,7052)",
        "name":"Filter Thickness Minimum",
        "keyword":"FilterThicknessMinimum",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00187054":{
        "tag":"(0018,7054)",
        "name":"Filter Thickness Maximum",
        "keyword":"FilterThicknessMaximum",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00187056":{
        "tag":"(0018,7056)",
        "name":"Filter Beam Path Length Minimum",
        "keyword":"FilterBeamPathLengthMinimum",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "00187058":{
        "tag":"(0018,7058)",
        "name":"Filter Beam Path Length Maximum",
        "keyword":"FilterBeamPathLengthMaximum",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "00187060":{
        "tag":"(0018,7060)",
        "name":"Exposure Control Mode",
        "keyword":"ExposureControlMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00187062":{
        "tag":"(0018,7062)",
        "name":"Exposure Control Mode Description",
        "keyword":"ExposureControlModeDescription",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00187064":{
        "tag":"(0018,7064)",
        "name":"Exposure Status",
        "keyword":"ExposureStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00187065":{
        "tag":"(0018,7065)",
        "name":"Phototimer Setting",
        "keyword":"PhototimerSetting",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00188150":{
        "tag":"(0018,8150)",
        "name":"Exposure Time in \u00b5S",
        "keyword":"ExposureTimeInuS",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00188151":{
        "tag":"(0018,8151)",
        "name":"X-Ray Tube Current in \u00b5A",
        "keyword":"XRayTubeCurrentInuA",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00189004":{
        "tag":"(0018,9004)",
        "name":"Content Qualification",
        "keyword":"ContentQualification",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189005":{
        "tag":"(0018,9005)",
        "name":"Pulse Sequence Name",
        "keyword":"PulseSequenceName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00189006":{
        "tag":"(0018,9006)",
        "name":"MR Imaging Modifier Sequence",
        "keyword":"MRImagingModifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189008":{
        "tag":"(0018,9008)",
        "name":"Echo Pulse Sequence",
        "keyword":"EchoPulseSequence",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189009":{
        "tag":"(0018,9009)",
        "name":"Inversion Recovery",
        "keyword":"InversionRecovery",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189010":{
        "tag":"(0018,9010)",
        "name":"Flow Compensation",
        "keyword":"FlowCompensation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189011":{
        "tag":"(0018,9011)",
        "name":"Multiple Spin Echo",
        "keyword":"MultipleSpinEcho",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189012":{
        "tag":"(0018,9012)",
        "name":"Multi-planar Excitation",
        "keyword":"MultiPlanarExcitation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189014":{
        "tag":"(0018,9014)",
        "name":"Phase Contrast",
        "keyword":"PhaseContrast",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189015":{
        "tag":"(0018,9015)",
        "name":"Time of Flight Contrast",
        "keyword":"TimeOfFlightContrast",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189016":{
        "tag":"(0018,9016)",
        "name":"Spoiling",
        "keyword":"Spoiling",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189017":{
        "tag":"(0018,9017)",
        "name":"Steady State Pulse Sequence",
        "keyword":"SteadyStatePulseSequence",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189018":{
        "tag":"(0018,9018)",
        "name":"Echo Planar Pulse Sequence",
        "keyword":"EchoPlanarPulseSequence",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189019":{
        "tag":"(0018,9019)",
        "name":"Tag Angle First Axis",
        "keyword":"TagAngleFirstAxis",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189020":{
        "tag":"(0018,9020)",
        "name":"Magnetization Transfer",
        "keyword":"MagnetizationTransfer",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189021":{
        "tag":"(0018,9021)",
        "name":"T2 Preparation",
        "keyword":"T2Preparation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189022":{
        "tag":"(0018,9022)",
        "name":"Blood Signal Nulling",
        "keyword":"BloodSignalNulling",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189024":{
        "tag":"(0018,9024)",
        "name":"Saturation Recovery",
        "keyword":"SaturationRecovery",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189025":{
        "tag":"(0018,9025)",
        "name":"Spectrally Selected Suppression",
        "keyword":"SpectrallySelectedSuppression",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189026":{
        "tag":"(0018,9026)",
        "name":"Spectrally Selected Excitation",
        "keyword":"SpectrallySelectedExcitation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189027":{
        "tag":"(0018,9027)",
        "name":"Spatial Pre-saturation",
        "keyword":"SpatialPresaturation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189028":{
        "tag":"(0018,9028)",
        "name":"Tagging",
        "keyword":"Tagging",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189029":{
        "tag":"(0018,9029)",
        "name":"Oversampling Phase",
        "keyword":"OversamplingPhase",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189030":{
        "tag":"(0018,9030)",
        "name":"Tag Spacing First Dimension",
        "keyword":"TagSpacingFirstDimension",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189032":{
        "tag":"(0018,9032)",
        "name":"Geometry of k-Space Traversal",
        "keyword":"GeometryOfKSpaceTraversal",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189033":{
        "tag":"(0018,9033)",
        "name":"Segmented k-Space Traversal",
        "keyword":"SegmentedKSpaceTraversal",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189034":{
        "tag":"(0018,9034)",
        "name":"Rectilinear Phase Encode Reordering",
        "keyword":"RectilinearPhaseEncodeReordering",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189035":{
        "tag":"(0018,9035)",
        "name":"Tag Thickness",
        "keyword":"TagThickness",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189036":{
        "tag":"(0018,9036)",
        "name":"Partial Fourier Direction",
        "keyword":"PartialFourierDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189037":{
        "tag":"(0018,9037)",
        "name":"Cardiac Synchronization Technique",
        "keyword":"CardiacSynchronizationTechnique",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189041":{
        "tag":"(0018,9041)",
        "name":"Receive Coil Manufacturer Name",
        "keyword":"ReceiveCoilManufacturerName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189042":{
        "tag":"(0018,9042)",
        "name":"MR Receive Coil Sequence",
        "keyword":"MRReceiveCoilSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189043":{
        "tag":"(0018,9043)",
        "name":"Receive Coil Type",
        "keyword":"ReceiveCoilType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189044":{
        "tag":"(0018,9044)",
        "name":"Quadrature Receive Coil",
        "keyword":"QuadratureReceiveCoil",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189045":{
        "tag":"(0018,9045)",
        "name":"Multi-Coil Definition Sequence",
        "keyword":"MultiCoilDefinitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189046":{
        "tag":"(0018,9046)",
        "name":"Multi-Coil Configuration",
        "keyword":"MultiCoilConfiguration",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189047":{
        "tag":"(0018,9047)",
        "name":"Multi-Coil Element Name",
        "keyword":"MultiCoilElementName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00189048":{
        "tag":"(0018,9048)",
        "name":"Multi-Coil Element Used",
        "keyword":"MultiCoilElementUsed",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189049":{
        "tag":"(0018,9049)",
        "name":"MR Transmit Coil Sequence",
        "keyword":"MRTransmitCoilSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189050":{
        "tag":"(0018,9050)",
        "name":"Transmit Coil Manufacturer Name",
        "keyword":"TransmitCoilManufacturerName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189051":{
        "tag":"(0018,9051)",
        "name":"Transmit Coil Type",
        "keyword":"TransmitCoilType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189052":{
        "tag":"(0018,9052)",
        "name":"Spectral Width",
        "keyword":"SpectralWidth",
        "vr":"FD",
        "vm":"1-2",
        "retired":false
    },
    "00189053":{
        "tag":"(0018,9053)",
        "name":"Chemical Shift Reference",
        "keyword":"ChemicalShiftReference",
        "vr":"FD",
        "vm":"1-2",
        "retired":false
    },
    "00189054":{
        "tag":"(0018,9054)",
        "name":"Volume Localization Technique",
        "keyword":"VolumeLocalizationTechnique",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189058":{
        "tag":"(0018,9058)",
        "name":"MR Acquisition Frequency Encoding Steps",
        "keyword":"MRAcquisitionFrequencyEncodingSteps",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189059":{
        "tag":"(0018,9059)",
        "name":"De-coupling",
        "keyword":"Decoupling",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189060":{
        "tag":"(0018,9060)",
        "name":"De-coupled Nucleus",
        "keyword":"DecoupledNucleus",
        "vr":"CS",
        "vm":"1-2",
        "retired":false
    },
    "00189061":{
        "tag":"(0018,9061)",
        "name":"De-coupling Frequency",
        "keyword":"DecouplingFrequency",
        "vr":"FD",
        "vm":"1-2",
        "retired":false
    },
    "00189062":{
        "tag":"(0018,9062)",
        "name":"De-coupling Method",
        "keyword":"DecouplingMethod",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189063":{
        "tag":"(0018,9063)",
        "name":"De-coupling Chemical Shift Reference",
        "keyword":"DecouplingChemicalShiftReference",
        "vr":"FD",
        "vm":"1-2",
        "retired":false
    },
    "00189064":{
        "tag":"(0018,9064)",
        "name":"k-space Filtering",
        "keyword":"KSpaceFiltering",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189065":{
        "tag":"(0018,9065)",
        "name":"Time Domain Filtering",
        "keyword":"TimeDomainFiltering",
        "vr":"CS",
        "vm":"1-2",
        "retired":false
    },
    "00189066":{
        "tag":"(0018,9066)",
        "name":"Number of Zero Fills",
        "keyword":"NumberOfZeroFills",
        "vr":"US",
        "vm":"1-2",
        "retired":false
    },
    "00189067":{
        "tag":"(0018,9067)",
        "name":"Baseline Correction",
        "keyword":"BaselineCorrection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189069":{
        "tag":"(0018,9069)",
        "name":"Parallel Reduction Factor In-plane",
        "keyword":"ParallelReductionFactorInPlane",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189070":{
        "tag":"(0018,9070)",
        "name":"Cardiac R-R Interval Specified",
        "keyword":"CardiacRRIntervalSpecified",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189073":{
        "tag":"(0018,9073)",
        "name":"Acquisition Duration",
        "keyword":"AcquisitionDuration",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189074":{
        "tag":"(0018,9074)",
        "name":"Frame Acquisition DateTime",
        "keyword":"FrameAcquisitionDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00189075":{
        "tag":"(0018,9075)",
        "name":"Diffusion Directionality",
        "keyword":"DiffusionDirectionality",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189076":{
        "tag":"(0018,9076)",
        "name":"Diffusion Gradient Direction Sequence",
        "keyword":"DiffusionGradientDirectionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189077":{
        "tag":"(0018,9077)",
        "name":"Parallel Acquisition",
        "keyword":"ParallelAcquisition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189078":{
        "tag":"(0018,9078)",
        "name":"Parallel Acquisition Technique",
        "keyword":"ParallelAcquisitionTechnique",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189079":{
        "tag":"(0018,9079)",
        "name":"Inversion Times",
        "keyword":"InversionTimes",
        "vr":"FD",
        "vm":"1-n",
        "retired":false
    },
    "00189080":{
        "tag":"(0018,9080)",
        "name":"Metabolite Map Description",
        "keyword":"MetaboliteMapDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00189081":{
        "tag":"(0018,9081)",
        "name":"Partial Fourier",
        "keyword":"PartialFourier",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189082":{
        "tag":"(0018,9082)",
        "name":"Effective Echo Time",
        "keyword":"EffectiveEchoTime",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189083":{
        "tag":"(0018,9083)",
        "name":"Metabolite Map Code Sequence",
        "keyword":"MetaboliteMapCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189084":{
        "tag":"(0018,9084)",
        "name":"Chemical Shift Sequence",
        "keyword":"ChemicalShiftSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189085":{
        "tag":"(0018,9085)",
        "name":"Cardiac Signal Source",
        "keyword":"CardiacSignalSource",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189087":{
        "tag":"(0018,9087)",
        "name":"Diffusion b-value",
        "keyword":"DiffusionBValue",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189089":{
        "tag":"(0018,9089)",
        "name":"Diffusion Gradient Orientation",
        "keyword":"DiffusionGradientOrientation",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00189090":{
        "tag":"(0018,9090)",
        "name":"Velocity Encoding Direction",
        "keyword":"VelocityEncodingDirection",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00189091":{
        "tag":"(0018,9091)",
        "name":"Velocity Encoding Minimum Value",
        "keyword":"VelocityEncodingMinimumValue",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189092":{
        "tag":"(0018,9092)",
        "name":"Velocity Encoding Acquisition Sequence",
        "keyword":"VelocityEncodingAcquisitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189093":{
        "tag":"(0018,9093)",
        "name":"Number of k-Space Trajectories",
        "keyword":"NumberOfKSpaceTrajectories",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189094":{
        "tag":"(0018,9094)",
        "name":"Coverage of k-Space",
        "keyword":"CoverageOfKSpace",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189095":{
        "tag":"(0018,9095)",
        "name":"Spectroscopy Acquisition Phase Rows",
        "keyword":"SpectroscopyAcquisitionPhaseRows",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00189096":{
        "tag":"(0018,9096)",
        "name":"Parallel Reduction Factor In-plane (Retired)",
        "keyword":"ParallelReductionFactorInPlaneRetired",
        "vr":"FD",
        "vm":"1",
        "retired":true
    },
    "00189098":{
        "tag":"(0018,9098)",
        "name":"Transmitter Frequency",
        "keyword":"TransmitterFrequency",
        "vr":"FD",
        "vm":"1-2",
        "retired":false
    },
    "00189100":{
        "tag":"(0018,9100)",
        "name":"Resonant Nucleus",
        "keyword":"ResonantNucleus",
        "vr":"CS",
        "vm":"1-2",
        "retired":false
    },
    "00189101":{
        "tag":"(0018,9101)",
        "name":"Frequency Correction",
        "keyword":"FrequencyCorrection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189103":{
        "tag":"(0018,9103)",
        "name":"MR Spectroscopy FOV/Geometry Sequence",
        "keyword":"MRSpectroscopyFOVGeometrySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189104":{
        "tag":"(0018,9104)",
        "name":"Slab Thickness",
        "keyword":"SlabThickness",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189105":{
        "tag":"(0018,9105)",
        "name":"Slab Orientation",
        "keyword":"SlabOrientation",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00189106":{
        "tag":"(0018,9106)",
        "name":"Mid Slab Position",
        "keyword":"MidSlabPosition",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00189107":{
        "tag":"(0018,9107)",
        "name":"MR Spatial Saturation Sequence",
        "keyword":"MRSpatialSaturationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189112":{
        "tag":"(0018,9112)",
        "name":"MR Timing and Related Parameters Sequence",
        "keyword":"MRTimingAndRelatedParametersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189114":{
        "tag":"(0018,9114)",
        "name":"MR Echo Sequence",
        "keyword":"MREchoSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189115":{
        "tag":"(0018,9115)",
        "name":"MR Modifier Sequence",
        "keyword":"MRModifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189117":{
        "tag":"(0018,9117)",
        "name":"MR Diffusion Sequence",
        "keyword":"MRDiffusionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189118":{
        "tag":"(0018,9118)",
        "name":"Cardiac Synchronization Sequence",
        "keyword":"CardiacSynchronizationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189119":{
        "tag":"(0018,9119)",
        "name":"MR Averages Sequence",
        "keyword":"MRAveragesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189125":{
        "tag":"(0018,9125)",
        "name":"MR FOV/Geometry Sequence",
        "keyword":"MRFOVGeometrySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189126":{
        "tag":"(0018,9126)",
        "name":"Volume Localization Sequence",
        "keyword":"VolumeLocalizationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189127":{
        "tag":"(0018,9127)",
        "name":"Spectroscopy Acquisition Data Columns",
        "keyword":"SpectroscopyAcquisitionDataColumns",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00189147":{
        "tag":"(0018,9147)",
        "name":"Diffusion Anisotropy Type",
        "keyword":"DiffusionAnisotropyType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189151":{
        "tag":"(0018,9151)",
        "name":"Frame Reference DateTime",
        "keyword":"FrameReferenceDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00189152":{
        "tag":"(0018,9152)",
        "name":"MR Metabolite Map Sequence",
        "keyword":"MRMetaboliteMapSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189155":{
        "tag":"(0018,9155)",
        "name":"Parallel Reduction Factor out-of-plane",
        "keyword":"ParallelReductionFactorOutOfPlane",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189159":{
        "tag":"(0018,9159)",
        "name":"Spectroscopy Acquisition Out-of-plane Phase Steps",
        "keyword":"SpectroscopyAcquisitionOutOfPlanePhaseSteps",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00189166":{
        "tag":"(0018,9166)",
        "name":"Bulk Motion Status",
        "keyword":"BulkMotionStatus",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00189168":{
        "tag":"(0018,9168)",
        "name":"Parallel Reduction Factor Second In-plane",
        "keyword":"ParallelReductionFactorSecondInPlane",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189169":{
        "tag":"(0018,9169)",
        "name":"Cardiac Beat Rejection Technique",
        "keyword":"CardiacBeatRejectionTechnique",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189170":{
        "tag":"(0018,9170)",
        "name":"Respiratory Motion Compensation Technique",
        "keyword":"RespiratoryMotionCompensationTechnique",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189171":{
        "tag":"(0018,9171)",
        "name":"Respiratory Signal Source",
        "keyword":"RespiratorySignalSource",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189172":{
        "tag":"(0018,9172)",
        "name":"Bulk Motion Compensation Technique",
        "keyword":"BulkMotionCompensationTechnique",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189173":{
        "tag":"(0018,9173)",
        "name":"Bulk Motion Signal Source",
        "keyword":"BulkMotionSignalSource",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189174":{
        "tag":"(0018,9174)",
        "name":"Applicable Safety Standard Agency",
        "keyword":"ApplicableSafetyStandardAgency",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189175":{
        "tag":"(0018,9175)",
        "name":"Applicable Safety Standard Description",
        "keyword":"ApplicableSafetyStandardDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189176":{
        "tag":"(0018,9176)",
        "name":"Operating Mode Sequence",
        "keyword":"OperatingModeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189177":{
        "tag":"(0018,9177)",
        "name":"Operating Mode Type",
        "keyword":"OperatingModeType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189178":{
        "tag":"(0018,9178)",
        "name":"Operating Mode",
        "keyword":"OperatingMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189179":{
        "tag":"(0018,9179)",
        "name":"Specific Absorption Rate Definition",
        "keyword":"SpecificAbsorptionRateDefinition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189180":{
        "tag":"(0018,9180)",
        "name":"Gradient Output Type",
        "keyword":"GradientOutputType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189181":{
        "tag":"(0018,9181)",
        "name":"Specific Absorption Rate Value",
        "keyword":"SpecificAbsorptionRateValue",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189182":{
        "tag":"(0018,9182)",
        "name":"Gradient Output",
        "keyword":"GradientOutput",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189183":{
        "tag":"(0018,9183)",
        "name":"Flow Compensation Direction",
        "keyword":"FlowCompensationDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189184":{
        "tag":"(0018,9184)",
        "name":"Tagging Delay",
        "keyword":"TaggingDelay",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189185":{
        "tag":"(0018,9185)",
        "name":"Respiratory Motion Compensation Technique Description",
        "keyword":"RespiratoryMotionCompensationTechniqueDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00189186":{
        "tag":"(0018,9186)",
        "name":"Respiratory Signal Source ID",
        "keyword":"RespiratorySignalSourceID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00189195":{
        "tag":"(0018,9195)",
        "name":"Chemical Shift Minimum Integration Limit in Hz",
        "keyword":"ChemicalShiftMinimumIntegrationLimitInHz",
        "vr":"FD",
        "vm":"1",
        "retired":true
    },
    "00189196":{
        "tag":"(0018,9196)",
        "name":"Chemical Shift Maximum Integration Limit in Hz",
        "keyword":"ChemicalShiftMaximumIntegrationLimitInHz",
        "vr":"FD",
        "vm":"1",
        "retired":true
    },
    "00189197":{
        "tag":"(0018,9197)",
        "name":"MR Velocity Encoding Sequence",
        "keyword":"MRVelocityEncodingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189198":{
        "tag":"(0018,9198)",
        "name":"First Order Phase Correction",
        "keyword":"FirstOrderPhaseCorrection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189199":{
        "tag":"(0018,9199)",
        "name":"Water Referenced Phase Correction",
        "keyword":"WaterReferencedPhaseCorrection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189200":{
        "tag":"(0018,9200)",
        "name":"MR Spectroscopy Acquisition Type",
        "keyword":"MRSpectroscopyAcquisitionType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189214":{
        "tag":"(0018,9214)",
        "name":"Respiratory Cycle Position",
        "keyword":"RespiratoryCyclePosition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189217":{
        "tag":"(0018,9217)",
        "name":"Velocity Encoding Maximum Value",
        "keyword":"VelocityEncodingMaximumValue",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189218":{
        "tag":"(0018,9218)",
        "name":"Tag Spacing Second Dimension",
        "keyword":"TagSpacingSecondDimension",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189219":{
        "tag":"(0018,9219)",
        "name":"Tag Angle Second Axis",
        "keyword":"TagAngleSecondAxis",
        "vr":"SS",
        "vm":"1",
        "retired":false
    },
    "00189220":{
        "tag":"(0018,9220)",
        "name":"Frame Acquisition Duration",
        "keyword":"FrameAcquisitionDuration",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189226":{
        "tag":"(0018,9226)",
        "name":"MR Image Frame Type Sequence",
        "keyword":"MRImageFrameTypeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189227":{
        "tag":"(0018,9227)",
        "name":"MR Spectroscopy Frame Type Sequence",
        "keyword":"MRSpectroscopyFrameTypeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189231":{
        "tag":"(0018,9231)",
        "name":"MR Acquisition Phase Encoding Steps in-plane",
        "keyword":"MRAcquisitionPhaseEncodingStepsInPlane",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189232":{
        "tag":"(0018,9232)",
        "name":"MR Acquisition Phase Encoding Steps out-of-plane",
        "keyword":"MRAcquisitionPhaseEncodingStepsOutOfPlane",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189234":{
        "tag":"(0018,9234)",
        "name":"Spectroscopy Acquisition Phase Columns",
        "keyword":"SpectroscopyAcquisitionPhaseColumns",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00189236":{
        "tag":"(0018,9236)",
        "name":"Cardiac Cycle Position",
        "keyword":"CardiacCyclePosition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189239":{
        "tag":"(0018,9239)",
        "name":"Specific Absorption Rate Sequence",
        "keyword":"SpecificAbsorptionRateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189240":{
        "tag":"(0018,9240)",
        "name":"RF Echo Train Length",
        "keyword":"RFEchoTrainLength",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189241":{
        "tag":"(0018,9241)",
        "name":"Gradient Echo Train Length",
        "keyword":"GradientEchoTrainLength",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189250":{
        "tag":"(0018,9250)",
        "name":"Arterial Spin Labeling Contrast",
        "keyword":"ArterialSpinLabelingContrast",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189251":{
        "tag":"(0018,9251)",
        "name":"MR Arterial Spin Labeling Sequence",
        "keyword":"MRArterialSpinLabelingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189252":{
        "tag":"(0018,9252)",
        "name":"ASL Technique Description",
        "keyword":"ASLTechniqueDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189253":{
        "tag":"(0018,9253)",
        "name":"ASL Slab Number",
        "keyword":"ASLSlabNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189254":{
        "tag":"(0018,9254)",
        "name":"ASL Slab Thickness",
        "keyword":"ASLSlabThickness",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189255":{
        "tag":"(0018,9255)",
        "name":"ASL Slab Orientation",
        "keyword":"ASLSlabOrientation",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00189256":{
        "tag":"(0018,9256)",
        "name":"ASL Mid Slab Position",
        "keyword":"ASLMidSlabPosition",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00189257":{
        "tag":"(0018,9257)",
        "name":"ASL Context",
        "keyword":"ASLContext",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189258":{
        "tag":"(0018,9258)",
        "name":"ASL Pulse Train Duration",
        "keyword":"ASLPulseTrainDuration",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00189259":{
        "tag":"(0018,9259)",
        "name":"ASL Crusher Flag",
        "keyword":"ASLCrusherFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0018925A":{
        "tag":"(0018,925A)",
        "name":"ASL Crusher Flow Limit",
        "keyword":"ASLCrusherFlowLimit",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0018925B":{
        "tag":"(0018,925B)",
        "name":"ASL Crusher Description",
        "keyword":"ASLCrusherDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0018925C":{
        "tag":"(0018,925C)",
        "name":"ASL Bolus Cut-off Flag",
        "keyword":"ASLBolusCutoffFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0018925D":{
        "tag":"(0018,925D)",
        "name":"ASL Bolus Cut-off Timing Sequence",
        "keyword":"ASLBolusCutoffTimingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018925E":{
        "tag":"(0018,925E)",
        "name":"ASL Bolus Cut-off Technique",
        "keyword":"ASLBolusCutoffTechnique",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0018925F":{
        "tag":"(0018,925F)",
        "name":"ASL Bolus Cut-off Delay Time",
        "keyword":"ASLBolusCutoffDelayTime",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00189260":{
        "tag":"(0018,9260)",
        "name":"ASL Slab Sequence",
        "keyword":"ASLSlabSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189295":{
        "tag":"(0018,9295)",
        "name":"Chemical Shift Minimum Integration Limit in ppm",
        "keyword":"ChemicalShiftMinimumIntegrationLimitInppm",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189296":{
        "tag":"(0018,9296)",
        "name":"Chemical Shift Maximum Integration Limit in ppm",
        "keyword":"ChemicalShiftMaximumIntegrationLimitInppm",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189297":{
        "tag":"(0018,9297)",
        "name":"Water Reference Acquisition",
        "keyword":"WaterReferenceAcquisition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189298":{
        "tag":"(0018,9298)",
        "name":"Echo Peak Position",
        "keyword":"EchoPeakPosition",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00189301":{
        "tag":"(0018,9301)",
        "name":"CT Acquisition Type Sequence",
        "keyword":"CTAcquisitionTypeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189302":{
        "tag":"(0018,9302)",
        "name":"Acquisition Type",
        "keyword":"AcquisitionType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189303":{
        "tag":"(0018,9303)",
        "name":"Tube Angle",
        "keyword":"TubeAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189304":{
        "tag":"(0018,9304)",
        "name":"CT Acquisition Details Sequence",
        "keyword":"CTAcquisitionDetailsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189305":{
        "tag":"(0018,9305)",
        "name":"Revolution Time",
        "keyword":"RevolutionTime",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189306":{
        "tag":"(0018,9306)",
        "name":"Single Collimation Width",
        "keyword":"SingleCollimationWidth",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189307":{
        "tag":"(0018,9307)",
        "name":"Total Collimation Width",
        "keyword":"TotalCollimationWidth",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189308":{
        "tag":"(0018,9308)",
        "name":"CT Table Dynamics Sequence",
        "keyword":"CTTableDynamicsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189309":{
        "tag":"(0018,9309)",
        "name":"Table Speed",
        "keyword":"TableSpeed",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189310":{
        "tag":"(0018,9310)",
        "name":"Table Feed per Rotation",
        "keyword":"TableFeedPerRotation",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189311":{
        "tag":"(0018,9311)",
        "name":"Spiral Pitch Factor",
        "keyword":"SpiralPitchFactor",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189312":{
        "tag":"(0018,9312)",
        "name":"CT Geometry Sequence",
        "keyword":"CTGeometrySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189313":{
        "tag":"(0018,9313)",
        "name":"Data Collection Center (Patient)",
        "keyword":"DataCollectionCenterPatient",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00189314":{
        "tag":"(0018,9314)",
        "name":"CT Reconstruction Sequence",
        "keyword":"CTReconstructionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189315":{
        "tag":"(0018,9315)",
        "name":"Reconstruction Algorithm",
        "keyword":"ReconstructionAlgorithm",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189316":{
        "tag":"(0018,9316)",
        "name":"Convolution Kernel Group",
        "keyword":"ConvolutionKernelGroup",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189317":{
        "tag":"(0018,9317)",
        "name":"Reconstruction Field of View",
        "keyword":"ReconstructionFieldOfView",
        "vr":"FD",
        "vm":"2",
        "retired":false
    },
    "00189318":{
        "tag":"(0018,9318)",
        "name":"Reconstruction Target Center (Patient)",
        "keyword":"ReconstructionTargetCenterPatient",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00189319":{
        "tag":"(0018,9319)",
        "name":"Reconstruction Angle",
        "keyword":"ReconstructionAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189320":{
        "tag":"(0018,9320)",
        "name":"Image Filter",
        "keyword":"ImageFilter",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00189321":{
        "tag":"(0018,9321)",
        "name":"CT Exposure Sequence",
        "keyword":"CTExposureSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189322":{
        "tag":"(0018,9322)",
        "name":"Reconstruction Pixel Spacing",
        "keyword":"ReconstructionPixelSpacing",
        "vr":"FD",
        "vm":"2",
        "retired":false
    },
    "00189323":{
        "tag":"(0018,9323)",
        "name":"Exposure Modulation Type",
        "keyword":"ExposureModulationType",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00189324":{
        "tag":"(0018,9324)",
        "name":"Estimated Dose Saving",
        "keyword":"EstimatedDoseSaving",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189325":{
        "tag":"(0018,9325)",
        "name":"CT X-Ray Details Sequence",
        "keyword":"CTXRayDetailsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189326":{
        "tag":"(0018,9326)",
        "name":"CT Position Sequence",
        "keyword":"CTPositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189327":{
        "tag":"(0018,9327)",
        "name":"Table Position",
        "keyword":"TablePosition",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189328":{
        "tag":"(0018,9328)",
        "name":"Exposure Time in ms",
        "keyword":"ExposureTimeInms",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189329":{
        "tag":"(0018,9329)",
        "name":"CT Image Frame Type Sequence",
        "keyword":"CTImageFrameTypeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189330":{
        "tag":"(0018,9330)",
        "name":"X-Ray Tube Current in mA",
        "keyword":"XRayTubeCurrentInmA",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189332":{
        "tag":"(0018,9332)",
        "name":"Exposure in mAs",
        "keyword":"ExposureInmAs",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189333":{
        "tag":"(0018,9333)",
        "name":"Constant Volume Flag",
        "keyword":"ConstantVolumeFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189334":{
        "tag":"(0018,9334)",
        "name":"Fluoroscopy Flag",
        "keyword":"FluoroscopyFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189335":{
        "tag":"(0018,9335)",
        "name":"Distance Source to Data Collection Center",
        "keyword":"DistanceSourceToDataCollectionCenter",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189337":{
        "tag":"(0018,9337)",
        "name":"Contrast/Bolus Agent Number",
        "keyword":"ContrastBolusAgentNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189338":{
        "tag":"(0018,9338)",
        "name":"Contrast/Bolus Ingredient Code Sequence",
        "keyword":"ContrastBolusIngredientCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189340":{
        "tag":"(0018,9340)",
        "name":"Contrast Administration Profile Sequence",
        "keyword":"ContrastAdministrationProfileSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189341":{
        "tag":"(0018,9341)",
        "name":"Contrast/Bolus Usage Sequence",
        "keyword":"ContrastBolusUsageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189342":{
        "tag":"(0018,9342)",
        "name":"Contrast/Bolus Agent Administered",
        "keyword":"ContrastBolusAgentAdministered",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189343":{
        "tag":"(0018,9343)",
        "name":"Contrast/Bolus Agent Detected",
        "keyword":"ContrastBolusAgentDetected",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189344":{
        "tag":"(0018,9344)",
        "name":"Contrast/Bolus Agent Phase",
        "keyword":"ContrastBolusAgentPhase",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189345":{
        "tag":"(0018,9345)",
        "name":"CTDIvol",
        "keyword":"CTDIvol",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189346":{
        "tag":"(0018,9346)",
        "name":"CTDI Phantom Type Code Sequence",
        "keyword":"CTDIPhantomTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189351":{
        "tag":"(0018,9351)",
        "name":"Calcium Scoring Mass Factor Patient",
        "keyword":"CalciumScoringMassFactorPatient",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189352":{
        "tag":"(0018,9352)",
        "name":"Calcium Scoring Mass Factor Device",
        "keyword":"CalciumScoringMassFactorDevice",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "00189353":{
        "tag":"(0018,9353)",
        "name":"Energy Weighting Factor",
        "keyword":"EnergyWeightingFactor",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189360":{
        "tag":"(0018,9360)",
        "name":"CT Additional X-Ray Source Sequence",
        "keyword":"CTAdditionalXRaySourceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189401":{
        "tag":"(0018,9401)",
        "name":"Projection Pixel Calibration Sequence",
        "keyword":"ProjectionPixelCalibrationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189402":{
        "tag":"(0018,9402)",
        "name":"Distance Source to Isocenter",
        "keyword":"DistanceSourceToIsocenter",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189403":{
        "tag":"(0018,9403)",
        "name":"Distance Object to Table Top",
        "keyword":"DistanceObjectToTableTop",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189404":{
        "tag":"(0018,9404)",
        "name":"Object Pixel Spacing in Center of Beam",
        "keyword":"ObjectPixelSpacingInCenterOfBeam",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00189405":{
        "tag":"(0018,9405)",
        "name":"Positioner Position Sequence",
        "keyword":"PositionerPositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189406":{
        "tag":"(0018,9406)",
        "name":"Table Position Sequence",
        "keyword":"TablePositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189407":{
        "tag":"(0018,9407)",
        "name":"Collimator Shape Sequence",
        "keyword":"CollimatorShapeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189410":{
        "tag":"(0018,9410)",
        "name":"Planes in Acquisition",
        "keyword":"PlanesInAcquisition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189412":{
        "tag":"(0018,9412)",
        "name":"XA/XRF Frame Characteristics Sequence",
        "keyword":"XAXRFFrameCharacteristicsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189417":{
        "tag":"(0018,9417)",
        "name":"Frame Acquisition Sequence",
        "keyword":"FrameAcquisitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189420":{
        "tag":"(0018,9420)",
        "name":"X-Ray Receptor Type",
        "keyword":"XRayReceptorType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189423":{
        "tag":"(0018,9423)",
        "name":"Acquisition Protocol Name",
        "keyword":"AcquisitionProtocolName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189424":{
        "tag":"(0018,9424)",
        "name":"Acquisition Protocol Description",
        "keyword":"AcquisitionProtocolDescription",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00189425":{
        "tag":"(0018,9425)",
        "name":"Contrast/Bolus Ingredient Opaque",
        "keyword":"ContrastBolusIngredientOpaque",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189426":{
        "tag":"(0018,9426)",
        "name":"Distance Receptor Plane to Detector Housing",
        "keyword":"DistanceReceptorPlaneToDetectorHousing",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189427":{
        "tag":"(0018,9427)",
        "name":"Intensifier Active Shape",
        "keyword":"IntensifierActiveShape",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189428":{
        "tag":"(0018,9428)",
        "name":"Intensifier Active Dimension(s)",
        "keyword":"IntensifierActiveDimensions",
        "vr":"FL",
        "vm":"1-2",
        "retired":false
    },
    "00189429":{
        "tag":"(0018,9429)",
        "name":"Physical Detector Size",
        "keyword":"PhysicalDetectorSize",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00189430":{
        "tag":"(0018,9430)",
        "name":"Position of Isocenter Projection",
        "keyword":"PositionOfIsocenterProjection",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00189432":{
        "tag":"(0018,9432)",
        "name":"Field of View Sequence",
        "keyword":"FieldOfViewSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189433":{
        "tag":"(0018,9433)",
        "name":"Field of View Description",
        "keyword":"FieldOfViewDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189434":{
        "tag":"(0018,9434)",
        "name":"Exposure Control Sensing Regions Sequence",
        "keyword":"ExposureControlSensingRegionsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189435":{
        "tag":"(0018,9435)",
        "name":"Exposure Control Sensing Region Shape",
        "keyword":"ExposureControlSensingRegionShape",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189436":{
        "tag":"(0018,9436)",
        "name":"Exposure Control Sensing Region Left Vertical Edge",
        "keyword":"ExposureControlSensingRegionLeftVerticalEdge",
        "vr":"SS",
        "vm":"1",
        "retired":false
    },
    "00189437":{
        "tag":"(0018,9437)",
        "name":"Exposure Control Sensing Region Right Vertical Edge",
        "keyword":"ExposureControlSensingRegionRightVerticalEdge",
        "vr":"SS",
        "vm":"1",
        "retired":false
    },
    "00189438":{
        "tag":"(0018,9438)",
        "name":"Exposure Control Sensing Region Upper Horizontal Edge",
        "keyword":"ExposureControlSensingRegionUpperHorizontalEdge",
        "vr":"SS",
        "vm":"1",
        "retired":false
    },
    "00189439":{
        "tag":"(0018,9439)",
        "name":"Exposure Control Sensing Region Lower Horizontal Edge",
        "keyword":"ExposureControlSensingRegionLowerHorizontalEdge",
        "vr":"SS",
        "vm":"1",
        "retired":false
    },
    "00189440":{
        "tag":"(0018,9440)",
        "name":"Center of Circular Exposure Control Sensing Region",
        "keyword":"CenterOfCircularExposureControlSensingRegion",
        "vr":"SS",
        "vm":"2",
        "retired":false
    },
    "00189441":{
        "tag":"(0018,9441)",
        "name":"Radius of Circular Exposure Control Sensing Region",
        "keyword":"RadiusOfCircularExposureControlSensingRegion",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189442":{
        "tag":"(0018,9442)",
        "name":"Vertices of the Polygonal Exposure Control Sensing Region",
        "keyword":"VerticesOfThePolygonalExposureControlSensingRegion",
        "vr":"SS",
        "vm":"2-n",
        "retired":false
    },
    "00189445":{
        "tag":"(0018,9445)",
        "name":"",
        "keyword":"",
        "vr":"",
        "vm":"",
        "retired":false
    },
    "00189447":{
        "tag":"(0018,9447)",
        "name":"Column Angulation (Patient)",
        "keyword":"ColumnAngulationPatient",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189449":{
        "tag":"(0018,9449)",
        "name":"Beam Angle",
        "keyword":"BeamAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189451":{
        "tag":"(0018,9451)",
        "name":"Frame Detector Parameters Sequence",
        "keyword":"FrameDetectorParametersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189452":{
        "tag":"(0018,9452)",
        "name":"Calculated Anatomy Thickness",
        "keyword":"CalculatedAnatomyThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189455":{
        "tag":"(0018,9455)",
        "name":"Calibration Sequence",
        "keyword":"CalibrationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189456":{
        "tag":"(0018,9456)",
        "name":"Object Thickness Sequence",
        "keyword":"ObjectThicknessSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189457":{
        "tag":"(0018,9457)",
        "name":"Plane Identification",
        "keyword":"PlaneIdentification",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189461":{
        "tag":"(0018,9461)",
        "name":"Field of View Dimension(s) in Float",
        "keyword":"FieldOfViewDimensionsInFloat",
        "vr":"FL",
        "vm":"1-2",
        "retired":false
    },
    "00189462":{
        "tag":"(0018,9462)",
        "name":"Isocenter Reference System Sequence",
        "keyword":"IsocenterReferenceSystemSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189463":{
        "tag":"(0018,9463)",
        "name":"Positioner Isocenter Primary Angle",
        "keyword":"PositionerIsocenterPrimaryAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189464":{
        "tag":"(0018,9464)",
        "name":"Positioner Isocenter Secondary Angle",
        "keyword":"PositionerIsocenterSecondaryAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189465":{
        "tag":"(0018,9465)",
        "name":"Positioner Isocenter Detector Rotation Angle",
        "keyword":"PositionerIsocenterDetectorRotationAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189466":{
        "tag":"(0018,9466)",
        "name":"Table X Position to Isocenter",
        "keyword":"TableXPositionToIsocenter",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189467":{
        "tag":"(0018,9467)",
        "name":"Table Y Position to Isocenter",
        "keyword":"TableYPositionToIsocenter",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189468":{
        "tag":"(0018,9468)",
        "name":"Table Z Position to Isocenter",
        "keyword":"TableZPositionToIsocenter",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189469":{
        "tag":"(0018,9469)",
        "name":"Table Horizontal Rotation Angle",
        "keyword":"TableHorizontalRotationAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189470":{
        "tag":"(0018,9470)",
        "name":"Table Head Tilt Angle",
        "keyword":"TableHeadTiltAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189471":{
        "tag":"(0018,9471)",
        "name":"Table Cradle Tilt Angle",
        "keyword":"TableCradleTiltAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189472":{
        "tag":"(0018,9472)",
        "name":"Frame Display Shutter Sequence",
        "keyword":"FrameDisplayShutterSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189473":{
        "tag":"(0018,9473)",
        "name":"Acquired Image Area Dose Product",
        "keyword":"AcquiredImageAreaDoseProduct",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189474":{
        "tag":"(0018,9474)",
        "name":"C-arm Positioner Tabletop Relationship",
        "keyword":"CArmPositionerTabletopRelationship",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189476":{
        "tag":"(0018,9476)",
        "name":"X-Ray Geometry Sequence",
        "keyword":"XRayGeometrySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189477":{
        "tag":"(0018,9477)",
        "name":"Irradiation Event Identification Sequence",
        "keyword":"IrradiationEventIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189504":{
        "tag":"(0018,9504)",
        "name":"X-Ray 3D Frame Type Sequence",
        "keyword":"XRay3DFrameTypeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189506":{
        "tag":"(0018,9506)",
        "name":"Contributing Sources Sequence",
        "keyword":"ContributingSourcesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189507":{
        "tag":"(0018,9507)",
        "name":"X-Ray 3D Acquisition Sequence",
        "keyword":"XRay3DAcquisitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189508":{
        "tag":"(0018,9508)",
        "name":"Primary Positioner Scan Arc",
        "keyword":"PrimaryPositionerScanArc",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189509":{
        "tag":"(0018,9509)",
        "name":"Secondary Positioner Scan Arc",
        "keyword":"SecondaryPositionerScanArc",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189510":{
        "tag":"(0018,9510)",
        "name":"Primary Positioner Scan Start Angle",
        "keyword":"PrimaryPositionerScanStartAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189511":{
        "tag":"(0018,9511)",
        "name":"Secondary Positioner Scan Start Angle",
        "keyword":"SecondaryPositionerScanStartAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189514":{
        "tag":"(0018,9514)",
        "name":"Primary Positioner Increment",
        "keyword":"PrimaryPositionerIncrement",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189515":{
        "tag":"(0018,9515)",
        "name":"Secondary Positioner Increment",
        "keyword":"SecondaryPositionerIncrement",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00189516":{
        "tag":"(0018,9516)",
        "name":"Start Acquisition DateTime",
        "keyword":"StartAcquisitionDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00189517":{
        "tag":"(0018,9517)",
        "name":"End Acquisition DateTime",
        "keyword":"EndAcquisitionDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00189518":{
        "tag":"(0018,9518)",
        "name":"Primary Positioner Increment Sign",
        "keyword":"PrimaryPositionerIncrementSign",
        "vr":"SS",
        "vm":"1",
        "retired":false
    },
    "00189519":{
        "tag":"(0018,9519)",
        "name":"Secondary Positioner Increment Sign",
        "keyword":"SecondaryPositionerIncrementSign",
        "vr":"SS",
        "vm":"1",
        "retired":false
    },
    "00189524":{
        "tag":"(0018,9524)",
        "name":"Application Name",
        "keyword":"ApplicationName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189525":{
        "tag":"(0018,9525)",
        "name":"Application Version",
        "keyword":"ApplicationVersion",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189526":{
        "tag":"(0018,9526)",
        "name":"Application Manufacturer",
        "keyword":"ApplicationManufacturer",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189527":{
        "tag":"(0018,9527)",
        "name":"Algorithm Type",
        "keyword":"AlgorithmType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189528":{
        "tag":"(0018,9528)",
        "name":"Algorithm Description",
        "keyword":"AlgorithmDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189530":{
        "tag":"(0018,9530)",
        "name":"X-Ray 3D Reconstruction Sequence",
        "keyword":"XRay3DReconstructionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189531":{
        "tag":"(0018,9531)",
        "name":"Reconstruction Description",
        "keyword":"ReconstructionDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189538":{
        "tag":"(0018,9538)",
        "name":"Per Projection Acquisition Sequence",
        "keyword":"PerProjectionAcquisitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189541":{
        "tag":"(0018,9541)",
        "name":"Detector Position Sequence",
        "keyword":"DetectorPositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189542":{
        "tag":"(0018,9542)",
        "name":"X-Ray Acquisition Dose Sequence",
        "keyword":"XRayAcquisitionDoseSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189543":{
        "tag":"(0018,9543)",
        "name":"X-Ray Source Isocenter Primary Angle",
        "keyword":"XRaySourceIsocenterPrimaryAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189544":{
        "tag":"(0018,9544)",
        "name":"X-Ray Source Isocenter Secondary Angle",
        "keyword":"XRaySourceIsocenterSecondaryAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189545":{
        "tag":"(0018,9545)",
        "name":"Breast Support Isocenter Primary Angle",
        "keyword":"BreastSupportIsocenterPrimaryAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189546":{
        "tag":"(0018,9546)",
        "name":"Breast Support Isocenter Secondary Angle",
        "keyword":"BreastSupportIsocenterSecondaryAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189547":{
        "tag":"(0018,9547)",
        "name":"Breast Support X Position to Isocenter",
        "keyword":"BreastSupportXPositionToIsocenter",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189548":{
        "tag":"(0018,9548)",
        "name":"Breast Support Y Position to Isocenter",
        "keyword":"BreastSupportYPositionToIsocenter",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189549":{
        "tag":"(0018,9549)",
        "name":"Breast Support Z Position to Isocenter",
        "keyword":"BreastSupportZPositionToIsocenter",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189550":{
        "tag":"(0018,9550)",
        "name":"Detector Isocenter Primary Angle",
        "keyword":"DetectorIsocenterPrimaryAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189551":{
        "tag":"(0018,9551)",
        "name":"Detector Isocenter Secondary Angle",
        "keyword":"DetectorIsocenterSecondaryAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189552":{
        "tag":"(0018,9552)",
        "name":"Detector X Position to Isocenter",
        "keyword":"DetectorXPositionToIsocenter",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189553":{
        "tag":"(0018,9553)",
        "name":"Detector Y Position to Isocenter",
        "keyword":"DetectorYPositionToIsocenter",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189554":{
        "tag":"(0018,9554)",
        "name":"Detector Z Position to Isocenter",
        "keyword":"DetectorZPositionToIsocenter",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189555":{
        "tag":"(0018,9555)",
        "name":"X-Ray Grid Sequence",
        "keyword":"XRayGridSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189556":{
        "tag":"(0018,9556)",
        "name":"X-Ray Filter Sequence",
        "keyword":"XRayFilterSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189557":{
        "tag":"(0018,9557)",
        "name":"Detector Active Area TLHC Position",
        "keyword":"DetectorActiveAreaTLHCPosition",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00189558":{
        "tag":"(0018,9558)",
        "name":"Detector Active Area Orientation",
        "keyword":"DetectorActiveAreaOrientation",
        "vr":"FD",
        "vm":"6",
        "retired":false
    },
    "00189559":{
        "tag":"(0018,9559)",
        "name":"Positioner Primary Angle Direction",
        "keyword":"PositionerPrimaryAngleDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189601":{
        "tag":"(0018,9601)",
        "name":"Diffusion b-matrix Sequence",
        "keyword":"DiffusionBMatrixSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189602":{
        "tag":"(0018,9602)",
        "name":"Diffusion b-value XX",
        "keyword":"DiffusionBValueXX",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189603":{
        "tag":"(0018,9603)",
        "name":"Diffusion b-value XY",
        "keyword":"DiffusionBValueXY",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189604":{
        "tag":"(0018,9604)",
        "name":"Diffusion b-value XZ",
        "keyword":"DiffusionBValueXZ",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189605":{
        "tag":"(0018,9605)",
        "name":"Diffusion b-value YY",
        "keyword":"DiffusionBValueYY",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189606":{
        "tag":"(0018,9606)",
        "name":"Diffusion b-value YZ",
        "keyword":"DiffusionBValueYZ",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189607":{
        "tag":"(0018,9607)",
        "name":"Diffusion b-value ZZ",
        "keyword":"DiffusionBValueZZ",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189621":{
        "tag":"(0018,9621)",
        "name":"Functional MR Sequence",
        "keyword":"FunctionalMRSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189622":{
        "tag":"(0018,9622)",
        "name":"Functional Settling Phase Frames Present",
        "keyword":"FunctionalSettlingPhaseFramesPresent",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189623":{
        "tag":"(0018,9623)",
        "name":"Functional Sync Pulse",
        "keyword":"FunctionalSyncPulse",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00189624":{
        "tag":"(0018,9624)",
        "name":"Settling Phase Frame",
        "keyword":"SettlingPhaseFrame",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189701":{
        "tag":"(0018,9701)",
        "name":"Decay Correction DateTime",
        "keyword":"DecayCorrectionDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00189715":{
        "tag":"(0018,9715)",
        "name":"Start Density Threshold",
        "keyword":"StartDensityThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189716":{
        "tag":"(0018,9716)",
        "name":"Start Relative Density Difference Threshold",
        "keyword":"StartRelativeDensityDifferenceThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189717":{
        "tag":"(0018,9717)",
        "name":"Start Cardiac Trigger Count Threshold",
        "keyword":"StartCardiacTriggerCountThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189718":{
        "tag":"(0018,9718)",
        "name":"Start Respiratory Trigger Count Threshold",
        "keyword":"StartRespiratoryTriggerCountThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189719":{
        "tag":"(0018,9719)",
        "name":"Termination Counts Threshold",
        "keyword":"TerminationCountsThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189720":{
        "tag":"(0018,9720)",
        "name":"Termination Density Threshold",
        "keyword":"TerminationDensityThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189721":{
        "tag":"(0018,9721)",
        "name":"Termination Relative Density Threshold",
        "keyword":"TerminationRelativeDensityThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189722":{
        "tag":"(0018,9722)",
        "name":"Termination Time Threshold",
        "keyword":"TerminationTimeThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189723":{
        "tag":"(0018,9723)",
        "name":"Termination Cardiac Trigger Count Threshold",
        "keyword":"TerminationCardiacTriggerCountThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189724":{
        "tag":"(0018,9724)",
        "name":"Termination Respiratory Trigger Count Threshold",
        "keyword":"TerminationRespiratoryTriggerCountThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189725":{
        "tag":"(0018,9725)",
        "name":"Detector Geometry",
        "keyword":"DetectorGeometry",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189726":{
        "tag":"(0018,9726)",
        "name":"Transverse Detector Separation",
        "keyword":"TransverseDetectorSeparation",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189727":{
        "tag":"(0018,9727)",
        "name":"Axial Detector Dimension",
        "keyword":"AxialDetectorDimension",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189729":{
        "tag":"(0018,9729)",
        "name":"Radiopharmaceutical Agent Number",
        "keyword":"RadiopharmaceuticalAgentNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189732":{
        "tag":"(0018,9732)",
        "name":"PET Frame Acquisition Sequence",
        "keyword":"PETFrameAcquisitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189733":{
        "tag":"(0018,9733)",
        "name":"PET Detector Motion Details Sequence",
        "keyword":"PETDetectorMotionDetailsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189734":{
        "tag":"(0018,9734)",
        "name":"PET Table Dynamics Sequence",
        "keyword":"PETTableDynamicsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189735":{
        "tag":"(0018,9735)",
        "name":"PET Position Sequence",
        "keyword":"PETPositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189736":{
        "tag":"(0018,9736)",
        "name":"PET Frame Correction Factors Sequence",
        "keyword":"PETFrameCorrectionFactorsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189737":{
        "tag":"(0018,9737)",
        "name":"Radiopharmaceutical Usage Sequence",
        "keyword":"RadiopharmaceuticalUsageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189738":{
        "tag":"(0018,9738)",
        "name":"Attenuation Correction Source",
        "keyword":"AttenuationCorrectionSource",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189739":{
        "tag":"(0018,9739)",
        "name":"Number of Iterations",
        "keyword":"NumberOfIterations",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189740":{
        "tag":"(0018,9740)",
        "name":"Number of Subsets",
        "keyword":"NumberOfSubsets",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189749":{
        "tag":"(0018,9749)",
        "name":"PET Reconstruction Sequence",
        "keyword":"PETReconstructionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189751":{
        "tag":"(0018,9751)",
        "name":"PET Frame Type Sequence",
        "keyword":"PETFrameTypeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189755":{
        "tag":"(0018,9755)",
        "name":"Time of Flight Information Used",
        "keyword":"TimeOfFlightInformationUsed",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189756":{
        "tag":"(0018,9756)",
        "name":"Reconstruction Type",
        "keyword":"ReconstructionType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189758":{
        "tag":"(0018,9758)",
        "name":"Decay Corrected",
        "keyword":"DecayCorrected",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189759":{
        "tag":"(0018,9759)",
        "name":"Attenuation Corrected",
        "keyword":"AttenuationCorrected",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189760":{
        "tag":"(0018,9760)",
        "name":"Scatter Corrected",
        "keyword":"ScatterCorrected",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189761":{
        "tag":"(0018,9761)",
        "name":"Dead Time Corrected",
        "keyword":"DeadTimeCorrected",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189762":{
        "tag":"(0018,9762)",
        "name":"Gantry Motion Corrected",
        "keyword":"GantryMotionCorrected",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189763":{
        "tag":"(0018,9763)",
        "name":"Patient Motion Corrected",
        "keyword":"PatientMotionCorrected",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189764":{
        "tag":"(0018,9764)",
        "name":"Count Loss Normalization Corrected",
        "keyword":"CountLossNormalizationCorrected",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189765":{
        "tag":"(0018,9765)",
        "name":"Randoms Corrected",
        "keyword":"RandomsCorrected",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189766":{
        "tag":"(0018,9766)",
        "name":"Non-uniform Radial Sampling Corrected",
        "keyword":"NonUniformRadialSamplingCorrected",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189767":{
        "tag":"(0018,9767)",
        "name":"Sensitivity Calibrated",
        "keyword":"SensitivityCalibrated",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189768":{
        "tag":"(0018,9768)",
        "name":"Detector Normalization Correction",
        "keyword":"DetectorNormalizationCorrection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189769":{
        "tag":"(0018,9769)",
        "name":"Iterative Reconstruction Method",
        "keyword":"IterativeReconstructionMethod",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189770":{
        "tag":"(0018,9770)",
        "name":"Attenuation Correction Temporal Relationship",
        "keyword":"AttenuationCorrectionTemporalRelationship",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189771":{
        "tag":"(0018,9771)",
        "name":"Patient Physiological State Sequence",
        "keyword":"PatientPhysiologicalStateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189772":{
        "tag":"(0018,9772)",
        "name":"Patient Physiological State Code Sequence",
        "keyword":"PatientPhysiologicalStateCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189801":{
        "tag":"(0018,9801)",
        "name":"Depth(s) of Focus",
        "keyword":"DepthsOfFocus",
        "vr":"FD",
        "vm":"1-n",
        "retired":false
    },
    "00189803":{
        "tag":"(0018,9803)",
        "name":"Excluded Intervals Sequence",
        "keyword":"ExcludedIntervalsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189804":{
        "tag":"(0018,9804)",
        "name":"Exclusion Start DateTime",
        "keyword":"ExclusionStartDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00189805":{
        "tag":"(0018,9805)",
        "name":"Exclusion Duration",
        "keyword":"ExclusionDuration",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189806":{
        "tag":"(0018,9806)",
        "name":"US Image Description Sequence",
        "keyword":"USImageDescriptionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189807":{
        "tag":"(0018,9807)",
        "name":"Image Data Type Sequence",
        "keyword":"ImageDataTypeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189808":{
        "tag":"(0018,9808)",
        "name":"Data Type",
        "keyword":"DataType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189809":{
        "tag":"(0018,9809)",
        "name":"Transducer Scan Pattern Code Sequence",
        "keyword":"TransducerScanPatternCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018980B":{
        "tag":"(0018,980B)",
        "name":"Aliased Data Type",
        "keyword":"AliasedDataType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0018980C":{
        "tag":"(0018,980C)",
        "name":"Position Measuring Device Used",
        "keyword":"PositionMeasuringDeviceUsed",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0018980D":{
        "tag":"(0018,980D)",
        "name":"Transducer Geometry Code Sequence",
        "keyword":"TransducerGeometryCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018980E":{
        "tag":"(0018,980E)",
        "name":"Transducer Beam Steering Code Sequence",
        "keyword":"TransducerBeamSteeringCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018980F":{
        "tag":"(0018,980F)",
        "name":"Transducer Application Code Sequence",
        "keyword":"TransducerApplicationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189810":{
        "tag":"(0018,9810)",
        "name":"Zero Velocity Pixel Value",
        "keyword":"ZeroVelocityPixelValue",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00189900":{
        "tag":"(0018,9900)",
        "name":"Reference Location Label",
        "keyword":"ReferenceLocationLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189901":{
        "tag":"(0018,9901)",
        "name":"Reference Location Description",
        "keyword":"ReferenceLocationDescription",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00189902":{
        "tag":"(0018,9902)",
        "name":"Reference Basis Code Sequence",
        "keyword":"ReferenceBasisCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189903":{
        "tag":"(0018,9903)",
        "name":"Reference Geometry Code Sequence",
        "keyword":"ReferenceGeometryCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189904":{
        "tag":"(0018,9904)",
        "name":"Offset Distance",
        "keyword":"OffsetDistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00189905":{
        "tag":"(0018,9905)",
        "name":"Offset Direction",
        "keyword":"OffsetDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189906":{
        "tag":"(0018,9906)",
        "name":"Potential Scheduled Protocol Code Sequence",
        "keyword":"PotentialScheduledProtocolCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189907":{
        "tag":"(0018,9907)",
        "name":"Potential Requested Procedure Code Sequence",
        "keyword":"PotentialRequestedProcedureCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189908":{
        "tag":"(0018,9908)",
        "name":"Potential Reasons for Procedure",
        "keyword":"PotentialReasonsForProcedure",
        "vr":"UC",
        "vm":"1-n",
        "retired":false
    },
    "00189909":{
        "tag":"(0018,9909)",
        "name":"Potential Reasons for Procedure Code Sequence",
        "keyword":"PotentialReasonsForProcedureCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018990A":{
        "tag":"(0018,990A)",
        "name":"Potential Diagnostic Tasks",
        "keyword":"PotentialDiagnosticTasks",
        "vr":"UC",
        "vm":"1-n",
        "retired":false
    },
    "0018990B":{
        "tag":"(0018,990B)",
        "name":"Contraindications Code Sequence",
        "keyword":"ContraindicationsCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018990C":{
        "tag":"(0018,990C)",
        "name":"Referenced Defined Protocol Sequence",
        "keyword":"ReferencedDefinedProtocolSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018990D":{
        "tag":"(0018,990D)",
        "name":"Referenced Performed Protocol Sequence",
        "keyword":"ReferencedPerformedProtocolSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018990E":{
        "tag":"(0018,990E)",
        "name":"Predecessor Protocol Sequence",
        "keyword":"PredecessorProtocolSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018990F":{
        "tag":"(0018,990F)",
        "name":"Protocol Planning Information",
        "keyword":"ProtocolPlanningInformation",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00189910":{
        "tag":"(0018,9910)",
        "name":"Protocol Design Rationale",
        "keyword":"ProtocolDesignRationale",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00189911":{
        "tag":"(0018,9911)",
        "name":"Patient Specification Sequence",
        "keyword":"PatientSpecificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189912":{
        "tag":"(0018,9912)",
        "name":"Model Specification Sequence",
        "keyword":"ModelSpecificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189913":{
        "tag":"(0018,9913)",
        "name":"Parameters Specification Sequence",
        "keyword":"ParametersSpecificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189914":{
        "tag":"(0018,9914)",
        "name":"Instruction Sequence",
        "keyword":"InstructionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189915":{
        "tag":"(0018,9915)",
        "name":"Instruction Index",
        "keyword":"InstructionIndex",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189916":{
        "tag":"(0018,9916)",
        "name":"Instruction Text",
        "keyword":"InstructionText",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189917":{
        "tag":"(0018,9917)",
        "name":"Instruction Description",
        "keyword":"InstructionDescription",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00189918":{
        "tag":"(0018,9918)",
        "name":"Instruction Performed Flag",
        "keyword":"InstructionPerformedFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189919":{
        "tag":"(0018,9919)",
        "name":"Instruction Performed DateTime",
        "keyword":"InstructionPerformedDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "0018991A":{
        "tag":"(0018,991A)",
        "name":"Instruction Performance Comment",
        "keyword":"InstructionPerformanceComment",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "0018991B":{
        "tag":"(0018,991B)",
        "name":"Patient Positioning Instruction Sequence",
        "keyword":"PatientPositioningInstructionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018991C":{
        "tag":"(0018,991C)",
        "name":"Positioning Method Code Sequence",
        "keyword":"PositioningMethodCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018991D":{
        "tag":"(0018,991D)",
        "name":"Positioning Landmark Sequence",
        "keyword":"PositioningLandmarkSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018991E":{
        "tag":"(0018,991E)",
        "name":"Target Frame of Reference UID",
        "keyword":"TargetFrameOfReferenceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0018991F":{
        "tag":"(0018,991F)",
        "name":"Acquisition Protocol Element Specification Sequence",
        "keyword":"AcquisitionProtocolElementSpecificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189920":{
        "tag":"(0018,9920)",
        "name":"Acquisition Protocol Element Sequence",
        "keyword":"AcquisitionProtocolElementSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189921":{
        "tag":"(0018,9921)",
        "name":"Protocol Element Number",
        "keyword":"ProtocolElementNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00189922":{
        "tag":"(0018,9922)",
        "name":"Protocol Element Name",
        "keyword":"ProtocolElementName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189923":{
        "tag":"(0018,9923)",
        "name":"Protocol Element Characteristics Summary",
        "keyword":"ProtocolElementCharacteristicsSummary",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00189924":{
        "tag":"(0018,9924)",
        "name":"Protocol Element Purpose",
        "keyword":"ProtocolElementPurpose",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00189930":{
        "tag":"(0018,9930)",
        "name":"Acquisition Motion",
        "keyword":"AcquisitionMotion",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189931":{
        "tag":"(0018,9931)",
        "name":"Acquisition Start Location Sequence",
        "keyword":"AcquisitionStartLocationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189932":{
        "tag":"(0018,9932)",
        "name":"Acquisition End Location Sequence",
        "keyword":"AcquisitionEndLocationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189933":{
        "tag":"(0018,9933)",
        "name":"Reconstruction Protocol Element Specification Sequence",
        "keyword":"ReconstructionProtocolElementSpecificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189934":{
        "tag":"(0018,9934)",
        "name":"Reconstruction Protocol Element Sequence",
        "keyword":"ReconstructionProtocolElementSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189935":{
        "tag":"(0018,9935)",
        "name":"Storage Protocol Element Specification Sequence",
        "keyword":"StorageProtocolElementSpecificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189936":{
        "tag":"(0018,9936)",
        "name":"Storage Protocol Element Sequence",
        "keyword":"StorageProtocolElementSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189937":{
        "tag":"(0018,9937)",
        "name":"Requested Series Description",
        "keyword":"RequestedSeriesDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00189938":{
        "tag":"(0018,9938)",
        "name":"Source Acquisition Protocol Element Number",
        "keyword":"SourceAcquisitionProtocolElementNumber",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00189939":{
        "tag":"(0018,9939)",
        "name":"Source Acquisition Beam Number",
        "keyword":"SourceAcquisitionBeamNumber",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "0018993A":{
        "tag":"(0018,993A)",
        "name":"Source Reconstruction Protocol Element Number",
        "keyword":"SourceReconstructionProtocolElementNumber",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "0018993B":{
        "tag":"(0018,993B)",
        "name":"Reconstruction Start Location Sequence",
        "keyword":"ReconstructionStartLocationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018993C":{
        "tag":"(0018,993C)",
        "name":"Reconstruction End Location Sequence",
        "keyword":"ReconstructionEndLocationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018993D":{
        "tag":"(0018,993D)",
        "name":"Reconstruction Algorithm Sequence",
        "keyword":"ReconstructionAlgorithmSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018993E":{
        "tag":"(0018,993E)",
        "name":"Reconstruction Target Center Location Sequence",
        "keyword":"ReconstructionTargetCenterLocationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00189941":{
        "tag":"(0018,9941)",
        "name":"Image Filter Description",
        "keyword":"ImageFilterDescription",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00189942":{
        "tag":"(0018,9942)",
        "name":"CTDIvol Notification Trigger",
        "keyword":"CTDIvolNotificationTrigger",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189943":{
        "tag":"(0018,9943)",
        "name":"DLP Notification Trigger",
        "keyword":"DLPNotificationTrigger",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189944":{
        "tag":"(0018,9944)",
        "name":"Auto KVP Selection Type",
        "keyword":"AutoKVPSelectionType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00189945":{
        "tag":"(0018,9945)",
        "name":"Auto KVP Upper Bound",
        "keyword":"AutoKVPUpperBound",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189946":{
        "tag":"(0018,9946)",
        "name":"Auto KVP Lower Bound",
        "keyword":"AutoKVPLowerBound",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00189947":{
        "tag":"(0018,9947)",
        "name":"Protocol Defined Patient Position",
        "keyword":"ProtocolDefinedPatientPosition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0018A001":{
        "tag":"(0018,A001)",
        "name":"Contributing Equipment Sequence",
        "keyword":"ContributingEquipmentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0018A002":{
        "tag":"(0018,A002)",
        "name":"Contribution DateTime",
        "keyword":"ContributionDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "0018A003":{
        "tag":"(0018,A003)",
        "name":"Contribution Description",
        "keyword":"ContributionDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "0020000D":{
        "tag":"(0020,000D)",
        "name":"Study Instance UID",
        "keyword":"StudyInstanceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0020000E":{
        "tag":"(0020,000E)",
        "name":"Series Instance UID",
        "keyword":"SeriesInstanceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00200010":{
        "tag":"(0020,0010)",
        "name":"Study ID",
        "keyword":"StudyID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00200011":{
        "tag":"(0020,0011)",
        "name":"Series Number",
        "keyword":"SeriesNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00200012":{
        "tag":"(0020,0012)",
        "name":"Acquisition Number",
        "keyword":"AcquisitionNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00200013":{
        "tag":"(0020,0013)",
        "name":"Instance Number",
        "keyword":"InstanceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00200014":{
        "tag":"(0020,0014)",
        "name":"Isotope Number",
        "keyword":"IsotopeNumber",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00200015":{
        "tag":"(0020,0015)",
        "name":"Phase Number",
        "keyword":"PhaseNumber",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00200016":{
        "tag":"(0020,0016)",
        "name":"Interval Number",
        "keyword":"IntervalNumber",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00200017":{
        "tag":"(0020,0017)",
        "name":"Time Slot Number",
        "keyword":"TimeSlotNumber",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00200018":{
        "tag":"(0020,0018)",
        "name":"Angle Number",
        "keyword":"AngleNumber",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00200019":{
        "tag":"(0020,0019)",
        "name":"Item Number",
        "keyword":"ItemNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00200020":{
        "tag":"(0020,0020)",
        "name":"Patient Orientation",
        "keyword":"PatientOrientation",
        "vr":"CS",
        "vm":"2",
        "retired":false
    },
    "00200022":{
        "tag":"(0020,0022)",
        "name":"Overlay Number",
        "keyword":"OverlayNumber",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00200024":{
        "tag":"(0020,0024)",
        "name":"Curve Number",
        "keyword":"CurveNumber",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00200026":{
        "tag":"(0020,0026)",
        "name":"LUT Number",
        "keyword":"LUTNumber",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00200030":{
        "tag":"(0020,0030)",
        "name":"Image Position",
        "keyword":"ImagePosition",
        "vr":"DS",
        "vm":"3",
        "retired":true
    },
    "00200032":{
        "tag":"(0020,0032)",
        "name":"Image Position (Patient)",
        "keyword":"ImagePositionPatient",
        "vr":"DS",
        "vm":"3",
        "retired":false
    },
    "00200035":{
        "tag":"(0020,0035)",
        "name":"Image Orientation",
        "keyword":"ImageOrientation",
        "vr":"DS",
        "vm":"6",
        "retired":true
    },
    "00200037":{
        "tag":"(0020,0037)",
        "name":"Image Orientation (Patient)",
        "keyword":"ImageOrientationPatient",
        "vr":"DS",
        "vm":"6",
        "retired":false
    },
    "00200050":{
        "tag":"(0020,0050)",
        "name":"Location",
        "keyword":"Location",
        "vr":"DS",
        "vm":"1",
        "retired":true
    },
    "00200052":{
        "tag":"(0020,0052)",
        "name":"Frame of Reference UID",
        "keyword":"FrameOfReferenceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00200060":{
        "tag":"(0020,0060)",
        "name":"Laterality",
        "keyword":"Laterality",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00200062":{
        "tag":"(0020,0062)",
        "name":"Image Laterality",
        "keyword":"ImageLaterality",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00200070":{
        "tag":"(0020,0070)",
        "name":"Image Geometry Type",
        "keyword":"ImageGeometryType",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00200080":{
        "tag":"(0020,0080)",
        "name":"Masking Image",
        "keyword":"MaskingImage",
        "vr":"CS",
        "vm":"1-n",
        "retired":true
    },
    "002000AA":{
        "tag":"(0020,00AA)",
        "name":"Report Number",
        "keyword":"ReportNumber",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00200100":{
        "tag":"(0020,0100)",
        "name":"Temporal Position Identifier",
        "keyword":"TemporalPositionIdentifier",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00200105":{
        "tag":"(0020,0105)",
        "name":"Number of Temporal Positions",
        "keyword":"NumberOfTemporalPositions",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00200110":{
        "tag":"(0020,0110)",
        "name":"Temporal Resolution",
        "keyword":"TemporalResolution",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00200200":{
        "tag":"(0020,0200)",
        "name":"Synchronization Frame of Reference UID",
        "keyword":"SynchronizationFrameOfReferenceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00200242":{
        "tag":"(0020,0242)",
        "name":"SOP Instance UID of Concatenation Source",
        "keyword":"SOPInstanceUIDOfConcatenationSource",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00201000":{
        "tag":"(0020,1000)",
        "name":"Series in Study",
        "keyword":"SeriesInStudy",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00201001":{
        "tag":"(0020,1001)",
        "name":"Acquisitions in Series",
        "keyword":"AcquisitionsInSeries",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00201002":{
        "tag":"(0020,1002)",
        "name":"Images in Acquisition",
        "keyword":"ImagesInAcquisition",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00201003":{
        "tag":"(0020,1003)",
        "name":"Images in Series",
        "keyword":"ImagesInSeries",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00201004":{
        "tag":"(0020,1004)",
        "name":"Acquisitions in Study",
        "keyword":"AcquisitionsInStudy",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00201005":{
        "tag":"(0020,1005)",
        "name":"Images in Study",
        "keyword":"ImagesInStudy",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00201020":{
        "tag":"(0020,1020)",
        "name":"Reference",
        "keyword":"Reference",
        "vr":"LO",
        "vm":"1-n",
        "retired":true
    },
    "0020103F":{
        "tag":"(0020,103F)",
        "name":"Target Position Reference Indicator",
        "keyword":"TargetPositionReferenceIndicator",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00201040":{
        "tag":"(0020,1040)",
        "name":"Position Reference Indicator",
        "keyword":"PositionReferenceIndicator",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00201041":{
        "tag":"(0020,1041)",
        "name":"Slice Location",
        "keyword":"SliceLocation",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00201070":{
        "tag":"(0020,1070)",
        "name":"Other Study Numbers",
        "keyword":"OtherStudyNumbers",
        "vr":"IS",
        "vm":"1-n",
        "retired":true
    },
    "00201200":{
        "tag":"(0020,1200)",
        "name":"Number of Patient Related Studies",
        "keyword":"NumberOfPatientRelatedStudies",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00201202":{
        "tag":"(0020,1202)",
        "name":"Number of Patient Related Series",
        "keyword":"NumberOfPatientRelatedSeries",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00201204":{
        "tag":"(0020,1204)",
        "name":"Number of Patient Related Instances",
        "keyword":"NumberOfPatientRelatedInstances",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00201206":{
        "tag":"(0020,1206)",
        "name":"Number of Study Related Series",
        "keyword":"NumberOfStudyRelatedSeries",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00201208":{
        "tag":"(0020,1208)",
        "name":"Number of Study Related Instances",
        "keyword":"NumberOfStudyRelatedInstances",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00201209":{
        "tag":"(0020,1209)",
        "name":"Number of Series Related Instances",
        "keyword":"NumberOfSeriesRelatedInstances",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "002031XX":{
        "tag":"(0020,31XX)",
        "name":"Source Image IDs",
        "keyword":"SourceImageIDs",
        "vr":"CS",
        "vm":"1-n",
        "retired":true
    },
    "00203401":{
        "tag":"(0020,3401)",
        "name":"Modifying Device ID",
        "keyword":"ModifyingDeviceID",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00203402":{
        "tag":"(0020,3402)",
        "name":"Modified Image ID",
        "keyword":"ModifiedImageID",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00203403":{
        "tag":"(0020,3403)",
        "name":"Modified Image Date",
        "keyword":"ModifiedImageDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "00203404":{
        "tag":"(0020,3404)",
        "name":"Modifying Device Manufacturer",
        "keyword":"ModifyingDeviceManufacturer",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00203405":{
        "tag":"(0020,3405)",
        "name":"Modified Image Time",
        "keyword":"ModifiedImageTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "00203406":{
        "tag":"(0020,3406)",
        "name":"Modified Image Description",
        "keyword":"ModifiedImageDescription",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00204000":{
        "tag":"(0020,4000)",
        "name":"Image Comments",
        "keyword":"ImageComments",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00205000":{
        "tag":"(0020,5000)",
        "name":"Original Image Identification",
        "keyword":"OriginalImageIdentification",
        "vr":"AT",
        "vm":"1-n",
        "retired":true
    },
    "00205002":{
        "tag":"(0020,5002)",
        "name":"Original Image Identification Nomenclature",
        "keyword":"OriginalImageIdentificationNomenclature",
        "vr":"LO",
        "vm":"1-n",
        "retired":true
    },
    "00209056":{
        "tag":"(0020,9056)",
        "name":"Stack ID",
        "keyword":"StackID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00209057":{
        "tag":"(0020,9057)",
        "name":"In-Stack Position Number",
        "keyword":"InStackPositionNumber",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00209071":{
        "tag":"(0020,9071)",
        "name":"Frame Anatomy Sequence",
        "keyword":"FrameAnatomySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209072":{
        "tag":"(0020,9072)",
        "name":"Frame Laterality",
        "keyword":"FrameLaterality",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00209111":{
        "tag":"(0020,9111)",
        "name":"Frame Content Sequence",
        "keyword":"FrameContentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209113":{
        "tag":"(0020,9113)",
        "name":"Plane Position Sequence",
        "keyword":"PlanePositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209116":{
        "tag":"(0020,9116)",
        "name":"Plane Orientation Sequence",
        "keyword":"PlaneOrientationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209128":{
        "tag":"(0020,9128)",
        "name":"Temporal Position Index",
        "keyword":"TemporalPositionIndex",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00209153":{
        "tag":"(0020,9153)",
        "name":"Nominal Cardiac Trigger Delay Time",
        "keyword":"NominalCardiacTriggerDelayTime",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00209154":{
        "tag":"(0020,9154)",
        "name":"Nominal Cardiac Trigger Time Prior To R-Peak",
        "keyword":"NominalCardiacTriggerTimePriorToRPeak",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00209155":{
        "tag":"(0020,9155)",
        "name":"Actual Cardiac Trigger Time Prior To R-Peak",
        "keyword":"ActualCardiacTriggerTimePriorToRPeak",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00209156":{
        "tag":"(0020,9156)",
        "name":"Frame Acquisition Number",
        "keyword":"FrameAcquisitionNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00209157":{
        "tag":"(0020,9157)",
        "name":"Dimension Index Values",
        "keyword":"DimensionIndexValues",
        "vr":"UL",
        "vm":"1-n",
        "retired":false
    },
    "00209158":{
        "tag":"(0020,9158)",
        "name":"Frame Comments",
        "keyword":"FrameComments",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00209161":{
        "tag":"(0020,9161)",
        "name":"Concatenation UID",
        "keyword":"ConcatenationUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00209162":{
        "tag":"(0020,9162)",
        "name":"In-concatenation Number",
        "keyword":"InConcatenationNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00209163":{
        "tag":"(0020,9163)",
        "name":"In-concatenation Total Number",
        "keyword":"InConcatenationTotalNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00209164":{
        "tag":"(0020,9164)",
        "name":"Dimension Organization UID",
        "keyword":"DimensionOrganizationUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00209165":{
        "tag":"(0020,9165)",
        "name":"Dimension Index Pointer",
        "keyword":"DimensionIndexPointer",
        "vr":"AT",
        "vm":"1",
        "retired":false
    },
    "00209167":{
        "tag":"(0020,9167)",
        "name":"Functional Group Pointer",
        "keyword":"FunctionalGroupPointer",
        "vr":"AT",
        "vm":"1",
        "retired":false
    },
    "00209170":{
        "tag":"(0020,9170)",
        "name":"Unassigned Shared Converted Attributes Sequence",
        "keyword":"UnassignedSharedConvertedAttributesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209171":{
        "tag":"(0020,9171)",
        "name":"Unassigned Per-Frame Converted Attributes Sequence",
        "keyword":"UnassignedPerFrameConvertedAttributesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209172":{
        "tag":"(0020,9172)",
        "name":"Conversion Source Attributes Sequence",
        "keyword":"ConversionSourceAttributesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209213":{
        "tag":"(0020,9213)",
        "name":"Dimension Index Private Creator",
        "keyword":"DimensionIndexPrivateCreator",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00209221":{
        "tag":"(0020,9221)",
        "name":"Dimension Organization Sequence",
        "keyword":"DimensionOrganizationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209222":{
        "tag":"(0020,9222)",
        "name":"Dimension Index Sequence",
        "keyword":"DimensionIndexSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209228":{
        "tag":"(0020,9228)",
        "name":"Concatenation Frame Offset Number",
        "keyword":"ConcatenationFrameOffsetNumber",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00209238":{
        "tag":"(0020,9238)",
        "name":"Functional Group Private Creator",
        "keyword":"FunctionalGroupPrivateCreator",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00209241":{
        "tag":"(0020,9241)",
        "name":"Nominal Percentage of Cardiac Phase",
        "keyword":"NominalPercentageOfCardiacPhase",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00209245":{
        "tag":"(0020,9245)",
        "name":"Nominal Percentage of Respiratory Phase",
        "keyword":"NominalPercentageOfRespiratoryPhase",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00209246":{
        "tag":"(0020,9246)",
        "name":"Starting Respiratory Amplitude",
        "keyword":"StartingRespiratoryAmplitude",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00209247":{
        "tag":"(0020,9247)",
        "name":"Starting Respiratory Phase",
        "keyword":"StartingRespiratoryPhase",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00209248":{
        "tag":"(0020,9248)",
        "name":"Ending Respiratory Amplitude",
        "keyword":"EndingRespiratoryAmplitude",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00209249":{
        "tag":"(0020,9249)",
        "name":"Ending Respiratory Phase",
        "keyword":"EndingRespiratoryPhase",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00209250":{
        "tag":"(0020,9250)",
        "name":"Respiratory Trigger Type",
        "keyword":"RespiratoryTriggerType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00209251":{
        "tag":"(0020,9251)",
        "name":"R-R Interval Time Nominal",
        "keyword":"RRIntervalTimeNominal",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00209252":{
        "tag":"(0020,9252)",
        "name":"Actual Cardiac Trigger Delay Time",
        "keyword":"ActualCardiacTriggerDelayTime",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00209253":{
        "tag":"(0020,9253)",
        "name":"Respiratory Synchronization Sequence",
        "keyword":"RespiratorySynchronizationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209254":{
        "tag":"(0020,9254)",
        "name":"Respiratory Interval Time",
        "keyword":"RespiratoryIntervalTime",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00209255":{
        "tag":"(0020,9255)",
        "name":"Nominal Respiratory Trigger Delay Time",
        "keyword":"NominalRespiratoryTriggerDelayTime",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00209256":{
        "tag":"(0020,9256)",
        "name":"Respiratory Trigger Delay Threshold",
        "keyword":"RespiratoryTriggerDelayThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00209257":{
        "tag":"(0020,9257)",
        "name":"Actual Respiratory Trigger Delay Time",
        "keyword":"ActualRespiratoryTriggerDelayTime",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00209301":{
        "tag":"(0020,9301)",
        "name":"Image Position (Volume)",
        "keyword":"ImagePositionVolume",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00209302":{
        "tag":"(0020,9302)",
        "name":"Image Orientation (Volume)",
        "keyword":"ImageOrientationVolume",
        "vr":"FD",
        "vm":"6",
        "retired":false
    },
    "00209307":{
        "tag":"(0020,9307)",
        "name":"Ultrasound Acquisition Geometry",
        "keyword":"UltrasoundAcquisitionGeometry",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00209308":{
        "tag":"(0020,9308)",
        "name":"Apex Position",
        "keyword":"ApexPosition",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00209309":{
        "tag":"(0020,9309)",
        "name":"Volume to Transducer Mapping Matrix",
        "keyword":"VolumeToTransducerMappingMatrix",
        "vr":"FD",
        "vm":"16",
        "retired":false
    },
    "0020930A":{
        "tag":"(0020,930A)",
        "name":"Volume to Table Mapping Matrix",
        "keyword":"VolumeToTableMappingMatrix",
        "vr":"FD",
        "vm":"16",
        "retired":false
    },
    "0020930B":{
        "tag":"(0020,930B)",
        "name":"Volume to Transducer Relationship",
        "keyword":"VolumeToTransducerRelationship",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0020930C":{
        "tag":"(0020,930C)",
        "name":"Patient Frame of Reference Source",
        "keyword":"PatientFrameOfReferenceSource",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0020930D":{
        "tag":"(0020,930D)",
        "name":"Temporal Position Time Offset",
        "keyword":"TemporalPositionTimeOffset",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0020930E":{
        "tag":"(0020,930E)",
        "name":"Plane Position (Volume) Sequence",
        "keyword":"PlanePositionVolumeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0020930F":{
        "tag":"(0020,930F)",
        "name":"Plane Orientation (Volume) Sequence",
        "keyword":"PlaneOrientationVolumeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209310":{
        "tag":"(0020,9310)",
        "name":"Temporal Position Sequence",
        "keyword":"TemporalPositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209311":{
        "tag":"(0020,9311)",
        "name":"Dimension Organization Type",
        "keyword":"DimensionOrganizationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00209312":{
        "tag":"(0020,9312)",
        "name":"Volume Frame of Reference UID",
        "keyword":"VolumeFrameOfReferenceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00209313":{
        "tag":"(0020,9313)",
        "name":"Table Frame of Reference UID",
        "keyword":"TableFrameOfReferenceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00209421":{
        "tag":"(0020,9421)",
        "name":"Dimension Description Label",
        "keyword":"DimensionDescriptionLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00209450":{
        "tag":"(0020,9450)",
        "name":"Patient Orientation in Frame Sequence",
        "keyword":"PatientOrientationInFrameSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209453":{
        "tag":"(0020,9453)",
        "name":"Frame Label",
        "keyword":"FrameLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00209518":{
        "tag":"(0020,9518)",
        "name":"Acquisition Index",
        "keyword":"AcquisitionIndex",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00209529":{
        "tag":"(0020,9529)",
        "name":"Contributing SOP Instances Reference Sequence",
        "keyword":"ContributingSOPInstancesReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00209536":{
        "tag":"(0020,9536)",
        "name":"Reconstruction Index",
        "keyword":"ReconstructionIndex",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00220001":{
        "tag":"(0022,0001)",
        "name":"Light Path Filter Pass-Through Wavelength",
        "keyword":"LightPathFilterPassThroughWavelength",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00220002":{
        "tag":"(0022,0002)",
        "name":"Light Path Filter Pass Band",
        "keyword":"LightPathFilterPassBand",
        "vr":"US",
        "vm":"2",
        "retired":false
    },
    "00220003":{
        "tag":"(0022,0003)",
        "name":"Image Path Filter Pass-Through Wavelength",
        "keyword":"ImagePathFilterPassThroughWavelength",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00220004":{
        "tag":"(0022,0004)",
        "name":"Image Path Filter Pass Band",
        "keyword":"ImagePathFilterPassBand",
        "vr":"US",
        "vm":"2",
        "retired":false
    },
    "00220005":{
        "tag":"(0022,0005)",
        "name":"Patient Eye Movement Commanded",
        "keyword":"PatientEyeMovementCommanded",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00220006":{
        "tag":"(0022,0006)",
        "name":"Patient Eye Movement Command Code Sequence",
        "keyword":"PatientEyeMovementCommandCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00220007":{
        "tag":"(0022,0007)",
        "name":"Spherical Lens Power",
        "keyword":"SphericalLensPower",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220008":{
        "tag":"(0022,0008)",
        "name":"Cylinder Lens Power",
        "keyword":"CylinderLensPower",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220009":{
        "tag":"(0022,0009)",
        "name":"Cylinder Axis",
        "keyword":"CylinderAxis",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "0022000A":{
        "tag":"(0022,000A)",
        "name":"Emmetropic Magnification",
        "keyword":"EmmetropicMagnification",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "0022000B":{
        "tag":"(0022,000B)",
        "name":"Intra Ocular Pressure",
        "keyword":"IntraOcularPressure",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "0022000C":{
        "tag":"(0022,000C)",
        "name":"Horizontal Field of View",
        "keyword":"HorizontalFieldOfView",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "0022000D":{
        "tag":"(0022,000D)",
        "name":"Pupil Dilated",
        "keyword":"PupilDilated",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0022000E":{
        "tag":"(0022,000E)",
        "name":"Degree of Dilation",
        "keyword":"DegreeOfDilation",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220010":{
        "tag":"(0022,0010)",
        "name":"Stereo Baseline Angle",
        "keyword":"StereoBaselineAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220011":{
        "tag":"(0022,0011)",
        "name":"Stereo Baseline Displacement",
        "keyword":"StereoBaselineDisplacement",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220012":{
        "tag":"(0022,0012)",
        "name":"Stereo Horizontal Pixel Offset",
        "keyword":"StereoHorizontalPixelOffset",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220013":{
        "tag":"(0022,0013)",
        "name":"Stereo Vertical Pixel Offset",
        "keyword":"StereoVerticalPixelOffset",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220014":{
        "tag":"(0022,0014)",
        "name":"Stereo Rotation",
        "keyword":"StereoRotation",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220015":{
        "tag":"(0022,0015)",
        "name":"Acquisition Device Type Code Sequence",
        "keyword":"AcquisitionDeviceTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00220016":{
        "tag":"(0022,0016)",
        "name":"Illumination Type Code Sequence",
        "keyword":"IlluminationTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00220017":{
        "tag":"(0022,0017)",
        "name":"Light Path Filter Type Stack Code Sequence",
        "keyword":"LightPathFilterTypeStackCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00220018":{
        "tag":"(0022,0018)",
        "name":"Image Path Filter Type Stack Code Sequence",
        "keyword":"ImagePathFilterTypeStackCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00220019":{
        "tag":"(0022,0019)",
        "name":"Lenses Code Sequence",
        "keyword":"LensesCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0022001A":{
        "tag":"(0022,001A)",
        "name":"Channel Description Code Sequence",
        "keyword":"ChannelDescriptionCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0022001B":{
        "tag":"(0022,001B)",
        "name":"Refractive State Sequence",
        "keyword":"RefractiveStateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0022001C":{
        "tag":"(0022,001C)",
        "name":"Mydriatic Agent Code Sequence",
        "keyword":"MydriaticAgentCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0022001D":{
        "tag":"(0022,001D)",
        "name":"Relative Image Position Code Sequence",
        "keyword":"RelativeImagePositionCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0022001E":{
        "tag":"(0022,001E)",
        "name":"Camera Angle of View",
        "keyword":"CameraAngleOfView",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220020":{
        "tag":"(0022,0020)",
        "name":"Stereo Pairs Sequence",
        "keyword":"StereoPairsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00220021":{
        "tag":"(0022,0021)",
        "name":"Left Image Sequence",
        "keyword":"LeftImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00220022":{
        "tag":"(0022,0022)",
        "name":"Right Image Sequence",
        "keyword":"RightImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00220028":{
        "tag":"(0022,0028)",
        "name":"Stereo Pairs Present",
        "keyword":"StereoPairsPresent",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00220030":{
        "tag":"(0022,0030)",
        "name":"Axial Length of the Eye",
        "keyword":"AxialLengthOfTheEye",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220031":{
        "tag":"(0022,0031)",
        "name":"Ophthalmic Frame Location Sequence",
        "keyword":"OphthalmicFrameLocationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00220032":{
        "tag":"(0022,0032)",
        "name":"Reference Coordinates",
        "keyword":"ReferenceCoordinates",
        "vr":"FL",
        "vm":"2-2n",
        "retired":false
    },
    "00220035":{
        "tag":"(0022,0035)",
        "name":"Depth Spatial Resolution",
        "keyword":"DepthSpatialResolution",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220036":{
        "tag":"(0022,0036)",
        "name":"Maximum Depth Distortion",
        "keyword":"MaximumDepthDistortion",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220037":{
        "tag":"(0022,0037)",
        "name":"Along-scan Spatial Resolution",
        "keyword":"AlongScanSpatialResolution",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220038":{
        "tag":"(0022,0038)",
        "name":"Maximum Along-scan Distortion",
        "keyword":"MaximumAlongScanDistortion",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220039":{
        "tag":"(0022,0039)",
        "name":"Ophthalmic Image Orientation",
        "keyword":"OphthalmicImageOrientation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00220041":{
        "tag":"(0022,0041)",
        "name":"Depth of Transverse Image",
        "keyword":"DepthOfTransverseImage",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220042":{
        "tag":"(0022,0042)",
        "name":"Mydriatic Agent Concentration Units Sequence",
        "keyword":"MydriaticAgentConcentrationUnitsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00220048":{
        "tag":"(0022,0048)",
        "name":"Across-scan Spatial Resolution",
        "keyword":"AcrossScanSpatialResolution",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220049":{
        "tag":"(0022,0049)",
        "name":"Maximum Across-scan Distortion",
        "keyword":"MaximumAcrossScanDistortion",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "0022004E":{
        "tag":"(0022,004E)",
        "name":"Mydriatic Agent Concentration",
        "keyword":"MydriaticAgentConcentration",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00220055":{
        "tag":"(0022,0055)",
        "name":"Illumination Wave Length",
        "keyword":"IlluminationWaveLength",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220056":{
        "tag":"(0022,0056)",
        "name":"Illumination Power",
        "keyword":"IlluminationPower",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220057":{
        "tag":"(0022,0057)",
        "name":"Illumination Bandwidth",
        "keyword":"IlluminationBandwidth",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00220058":{
        "tag":"(0022,0058)",
        "name":"Mydriatic Agent Sequence",
        "keyword":"MydriaticAgentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221007":{
        "tag":"(0022,1007)",
        "name":"Ophthalmic Axial Measurements Right Eye Sequence",
        "keyword":"OphthalmicAxialMeasurementsRightEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221008":{
        "tag":"(0022,1008)",
        "name":"Ophthalmic Axial Measurements Left Eye Sequence",
        "keyword":"OphthalmicAxialMeasurementsLeftEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221009":{
        "tag":"(0022,1009)",
        "name":"Ophthalmic Axial Measurements Device Type",
        "keyword":"OphthalmicAxialMeasurementsDeviceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00221010":{
        "tag":"(0022,1010)",
        "name":"Ophthalmic Axial Length Measurements Type",
        "keyword":"OphthalmicAxialLengthMeasurementsType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00221012":{
        "tag":"(0022,1012)",
        "name":"Ophthalmic Axial Length Sequence",
        "keyword":"OphthalmicAxialLengthSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221019":{
        "tag":"(0022,1019)",
        "name":"Ophthalmic Axial Length",
        "keyword":"OphthalmicAxialLength",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221024":{
        "tag":"(0022,1024)",
        "name":"Lens Status Code Sequence",
        "keyword":"LensStatusCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221025":{
        "tag":"(0022,1025)",
        "name":"Vitreous Status Code Sequence",
        "keyword":"VitreousStatusCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221028":{
        "tag":"(0022,1028)",
        "name":"IOL Formula Code Sequence",
        "keyword":"IOLFormulaCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221029":{
        "tag":"(0022,1029)",
        "name":"IOL Formula Detail",
        "keyword":"IOLFormulaDetail",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00221033":{
        "tag":"(0022,1033)",
        "name":"Keratometer Index",
        "keyword":"KeratometerIndex",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221035":{
        "tag":"(0022,1035)",
        "name":"Source of Ophthalmic Axial Length Code Sequence",
        "keyword":"SourceOfOphthalmicAxialLengthCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221037":{
        "tag":"(0022,1037)",
        "name":"Target Refraction",
        "keyword":"TargetRefraction",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221039":{
        "tag":"(0022,1039)",
        "name":"Refractive Procedure Occurred",
        "keyword":"RefractiveProcedureOccurred",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00221040":{
        "tag":"(0022,1040)",
        "name":"Refractive Surgery Type Code Sequence",
        "keyword":"RefractiveSurgeryTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221044":{
        "tag":"(0022,1044)",
        "name":"Ophthalmic Ultrasound Method Code Sequence",
        "keyword":"OphthalmicUltrasoundMethodCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221050":{
        "tag":"(0022,1050)",
        "name":"Ophthalmic Axial Length Measurements Sequence",
        "keyword":"OphthalmicAxialLengthMeasurementsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221053":{
        "tag":"(0022,1053)",
        "name":"IOL Power",
        "keyword":"IOLPower",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221054":{
        "tag":"(0022,1054)",
        "name":"Predicted Refractive Error",
        "keyword":"PredictedRefractiveError",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221059":{
        "tag":"(0022,1059)",
        "name":"Ophthalmic Axial Length Velocity",
        "keyword":"OphthalmicAxialLengthVelocity",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221065":{
        "tag":"(0022,1065)",
        "name":"Lens Status Description",
        "keyword":"LensStatusDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00221066":{
        "tag":"(0022,1066)",
        "name":"Vitreous Status Description",
        "keyword":"VitreousStatusDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00221090":{
        "tag":"(0022,1090)",
        "name":"IOL Power Sequence",
        "keyword":"IOLPowerSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221092":{
        "tag":"(0022,1092)",
        "name":"Lens Constant Sequence",
        "keyword":"LensConstantSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221093":{
        "tag":"(0022,1093)",
        "name":"IOL Manufacturer",
        "keyword":"IOLManufacturer",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00221094":{
        "tag":"(0022,1094)",
        "name":"Lens Constant Description",
        "keyword":"LensConstantDescription",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00221095":{
        "tag":"(0022,1095)",
        "name":"Implant Name",
        "keyword":"ImplantName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00221096":{
        "tag":"(0022,1096)",
        "name":"Keratometry Measurement Type Code Sequence",
        "keyword":"KeratometryMeasurementTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221097":{
        "tag":"(0022,1097)",
        "name":"Implant Part Number",
        "keyword":"ImplantPartNumber",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00221100":{
        "tag":"(0022,1100)",
        "name":"Referenced Ophthalmic Axial Measurements Sequence",
        "keyword":"ReferencedOphthalmicAxialMeasurementsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221101":{
        "tag":"(0022,1101)",
        "name":"Ophthalmic Axial Length Measurements Segment Name Code Sequence",
        "keyword":"OphthalmicAxialLengthMeasurementsSegmentNameCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221103":{
        "tag":"(0022,1103)",
        "name":"Refractive Error Before Refractive Surgery Code Sequence",
        "keyword":"RefractiveErrorBeforeRefractiveSurgeryCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221121":{
        "tag":"(0022,1121)",
        "name":"IOL Power For Exact Emmetropia",
        "keyword":"IOLPowerForExactEmmetropia",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221122":{
        "tag":"(0022,1122)",
        "name":"IOL Power For Exact Target Refraction",
        "keyword":"IOLPowerForExactTargetRefraction",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221125":{
        "tag":"(0022,1125)",
        "name":"Anterior Chamber Depth Definition Code Sequence",
        "keyword":"AnteriorChamberDepthDefinitionCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221127":{
        "tag":"(0022,1127)",
        "name":"Lens Thickness Sequence",
        "keyword":"LensThicknessSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221128":{
        "tag":"(0022,1128)",
        "name":"Anterior Chamber Depth Sequence",
        "keyword":"AnteriorChamberDepthSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221130":{
        "tag":"(0022,1130)",
        "name":"Lens Thickness",
        "keyword":"LensThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221131":{
        "tag":"(0022,1131)",
        "name":"Anterior Chamber Depth",
        "keyword":"AnteriorChamberDepth",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221132":{
        "tag":"(0022,1132)",
        "name":"Source of Lens Thickness Data Code Sequence",
        "keyword":"SourceOfLensThicknessDataCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221133":{
        "tag":"(0022,1133)",
        "name":"Source of Anterior Chamber Depth Data Code Sequence",
        "keyword":"SourceOfAnteriorChamberDepthDataCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221134":{
        "tag":"(0022,1134)",
        "name":"Source of Refractive Measurements Sequence",
        "keyword":"SourceOfRefractiveMeasurementsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221135":{
        "tag":"(0022,1135)",
        "name":"Source of Refractive Measurements Code Sequence",
        "keyword":"SourceOfRefractiveMeasurementsCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221140":{
        "tag":"(0022,1140)",
        "name":"Ophthalmic Axial Length Measurement Modified",
        "keyword":"OphthalmicAxialLengthMeasurementModified",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00221150":{
        "tag":"(0022,1150)",
        "name":"Ophthalmic Axial Length Data Source Code Sequence",
        "keyword":"OphthalmicAxialLengthDataSourceCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221153":{
        "tag":"(0022,1153)",
        "name":"Ophthalmic Axial Length Acquisition Method Code Sequence",
        "keyword":"OphthalmicAxialLengthAcquisitionMethodCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00221155":{
        "tag":"(0022,1155)",
        "name":"Signal to Noise Ratio",
        "keyword":"SignalToNoiseRatio",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221159":{
        "tag":"(0022,1159)",
        "name":"Ophthalmic Axial Length Data Source Description",
        "keyword":"OphthalmicAxialLengthDataSourceDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00221210":{
        "tag":"(0022,1210)",
        "name":"Ophthalmic Axial Length Measurements Total Length Sequence",
        "keyword":"OphthalmicAxialLengthMeasurementsTotalLengthSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221211":{
        "tag":"(0022,1211)",
        "name":"Ophthalmic Axial Length Measurements Segmental Length Sequence",
        "keyword":"OphthalmicAxialLengthMeasurementsSegmentalLengthSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221212":{
        "tag":"(0022,1212)",
        "name":"Ophthalmic Axial Length Measurements Length Summation Sequence",
        "keyword":"OphthalmicAxialLengthMeasurementsLengthSummationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221220":{
        "tag":"(0022,1220)",
        "name":"Ultrasound Ophthalmic Axial Length Measurements Sequence",
        "keyword":"UltrasoundOphthalmicAxialLengthMeasurementsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221225":{
        "tag":"(0022,1225)",
        "name":"Optical Ophthalmic Axial Length Measurements Sequence",
        "keyword":"OpticalOphthalmicAxialLengthMeasurementsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221230":{
        "tag":"(0022,1230)",
        "name":"Ultrasound Selected Ophthalmic Axial Length Sequence",
        "keyword":"UltrasoundSelectedOphthalmicAxialLengthSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221250":{
        "tag":"(0022,1250)",
        "name":"Ophthalmic Axial Length Selection Method Code Sequence",
        "keyword":"OphthalmicAxialLengthSelectionMethodCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221255":{
        "tag":"(0022,1255)",
        "name":"Optical Selected Ophthalmic Axial Length Sequence",
        "keyword":"OpticalSelectedOphthalmicAxialLengthSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221257":{
        "tag":"(0022,1257)",
        "name":"Selected Segmental Ophthalmic Axial Length Sequence",
        "keyword":"SelectedSegmentalOphthalmicAxialLengthSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221260":{
        "tag":"(0022,1260)",
        "name":"Selected Total Ophthalmic Axial Length Sequence",
        "keyword":"SelectedTotalOphthalmicAxialLengthSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221262":{
        "tag":"(0022,1262)",
        "name":"Ophthalmic Axial Length Quality Metric Sequence",
        "keyword":"OphthalmicAxialLengthQualityMetricSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221265":{
        "tag":"(0022,1265)",
        "name":"Ophthalmic Axial Length Quality Metric Type Code Sequence",
        "keyword":"OphthalmicAxialLengthQualityMetricTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00221273":{
        "tag":"(0022,1273)",
        "name":"Ophthalmic Axial Length Quality Metric Type Description",
        "keyword":"OphthalmicAxialLengthQualityMetricTypeDescription",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00221300":{
        "tag":"(0022,1300)",
        "name":"Intraocular Lens Calculations Right Eye Sequence",
        "keyword":"IntraocularLensCalculationsRightEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221310":{
        "tag":"(0022,1310)",
        "name":"Intraocular Lens Calculations Left Eye Sequence",
        "keyword":"IntraocularLensCalculationsLeftEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221330":{
        "tag":"(0022,1330)",
        "name":"Referenced Ophthalmic Axial Length Measurement QC Image Sequence",
        "keyword":"ReferencedOphthalmicAxialLengthMeasurementQCImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221415":{
        "tag":"(0022,1415)",
        "name":"Ophthalmic Mapping Device Type",
        "keyword":"OphthalmicMappingDeviceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00221420":{
        "tag":"(0022,1420)",
        "name":"Acquisition Method Code Sequence",
        "keyword":"AcquisitionMethodCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221423":{
        "tag":"(0022,1423)",
        "name":"Acquisition Method Algorithm Sequence",
        "keyword":"AcquisitionMethodAlgorithmSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221436":{
        "tag":"(0022,1436)",
        "name":"Ophthalmic Thickness Map Type Code Sequence",
        "keyword":"OphthalmicThicknessMapTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221443":{
        "tag":"(0022,1443)",
        "name":"Ophthalmic Thickness Mapping Normals Sequence",
        "keyword":"OphthalmicThicknessMappingNormalsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221445":{
        "tag":"(0022,1445)",
        "name":"Retinal Thickness Definition Code Sequence",
        "keyword":"RetinalThicknessDefinitionCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221450":{
        "tag":"(0022,1450)",
        "name":"Pixel Value Mapping to Coded Concept Sequence",
        "keyword":"PixelValueMappingToCodedConceptSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221452":{
        "tag":"(0022,1452)",
        "name":"Mapped Pixel Value",
        "keyword":"MappedPixelValue",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00221454":{
        "tag":"(0022,1454)",
        "name":"Pixel Value Mapping Explanation",
        "keyword":"PixelValueMappingExplanation",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00221458":{
        "tag":"(0022,1458)",
        "name":"Ophthalmic Thickness Map Quality Threshold Sequence",
        "keyword":"OphthalmicThicknessMapQualityThresholdSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221460":{
        "tag":"(0022,1460)",
        "name":"Ophthalmic Thickness Map Threshold Quality Rating",
        "keyword":"OphthalmicThicknessMapThresholdQualityRating",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221463":{
        "tag":"(0022,1463)",
        "name":"Anatomic Structure Reference Point",
        "keyword":"AnatomicStructureReferencePoint",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00221465":{
        "tag":"(0022,1465)",
        "name":"Registration to Localizer Sequence",
        "keyword":"RegistrationToLocalizerSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221466":{
        "tag":"(0022,1466)",
        "name":"Registered Localizer Units",
        "keyword":"RegisteredLocalizerUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00221467":{
        "tag":"(0022,1467)",
        "name":"Registered Localizer Top Left Hand Corner",
        "keyword":"RegisteredLocalizerTopLeftHandCorner",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00221468":{
        "tag":"(0022,1468)",
        "name":"Registered Localizer Bottom Right Hand Corner",
        "keyword":"RegisteredLocalizerBottomRightHandCorner",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00221470":{
        "tag":"(0022,1470)",
        "name":"Ophthalmic Thickness Map Quality Rating Sequence",
        "keyword":"OphthalmicThicknessMapQualityRatingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221472":{
        "tag":"(0022,1472)",
        "name":"Relevant OPT Attributes Sequence",
        "keyword":"RelevantOPTAttributesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221512":{
        "tag":"(0022,1512)",
        "name":"Transformation Method Code Sequence",
        "keyword":"TransformationMethodCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221513":{
        "tag":"(0022,1513)",
        "name":"Transformation Algorithm Sequence",
        "keyword":"TransformationAlgorithmSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221515":{
        "tag":"(0022,1515)",
        "name":"Ophthalmic Axial Length Method",
        "keyword":"OphthalmicAxialLengthMethod",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00221517":{
        "tag":"(0022,1517)",
        "name":"Ophthalmic FOV",
        "keyword":"OphthalmicFOV",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221518":{
        "tag":"(0022,1518)",
        "name":"Two Dimensional to Three Dimensional Map Sequence",
        "keyword":"TwoDimensionalToThreeDimensionalMapSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221525":{
        "tag":"(0022,1525)",
        "name":"Wide Field Ophthalmic Photography Quality Rating Sequence",
        "keyword":"WideFieldOphthalmicPhotographyQualityRatingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221526":{
        "tag":"(0022,1526)",
        "name":"Wide Field Ophthalmic Photography Quality Threshold Sequence",
        "keyword":"WideFieldOphthalmicPhotographyQualityThresholdSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221527":{
        "tag":"(0022,1527)",
        "name":"Wide Field Ophthalmic Photography Threshold Quality Rating",
        "keyword":"WideFieldOphthalmicPhotographyThresholdQualityRating",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221528":{
        "tag":"(0022,1528)",
        "name":"X Coordinates Center Pixel View Angle",
        "keyword":"XCoordinatesCenterPixelViewAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221529":{
        "tag":"(0022,1529)",
        "name":"Y Coordinates Center Pixel View Angle",
        "keyword":"YCoordinatesCenterPixelViewAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221530":{
        "tag":"(0022,1530)",
        "name":"Number of Map Points",
        "keyword":"NumberOfMapPoints",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00221531":{
        "tag":"(0022,1531)",
        "name":"Two Dimensional to Three Dimensional Map Data",
        "keyword":"TwoDimensionalToThreeDimensionalMapData",
        "vr":"OF",
        "vm":"1",
        "retired":false
    },
    "00221612":{
        "tag":"(0022,1612)",
        "name":"Derivation Algorithm Sequence",
        "keyword":"DerivationAlgorithmSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221615":{
        "tag":"(0022,1615)",
        "name":"Ophthalmic Image Type Code Sequence",
        "keyword":"OphthalmicImageTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221616":{
        "tag":"(0022,1616)",
        "name":"Ophthalmic Image Type Description",
        "keyword":"OphthalmicImageTypeDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00221618":{
        "tag":"(0022,1618)",
        "name":"Scan Pattern Type Code Sequence",
        "keyword":"ScanPatternTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221620":{
        "tag":"(0022,1620)",
        "name":"Referenced Surface Mesh Identification Sequence",
        "keyword":"ReferencedSurfaceMeshIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221622":{
        "tag":"(0022,1622)",
        "name":"Ophthalmic Volumetric Properties Flag",
        "keyword":"OphthalmicVolumetricPropertiesFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00221624":{
        "tag":"(0022,1624)",
        "name":"Ophthalmic Anatomic Reference Point X-Coordinate",
        "keyword":"OphthalmicAnatomicReferencePointXCoordinate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221626":{
        "tag":"(0022,1626)",
        "name":"Ophthalmic Anatomic Reference Point Y-Coordinate",
        "keyword":"OphthalmicAnatomicReferencePointYCoordinate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221628":{
        "tag":"(0022,1628)",
        "name":"Ophthalmic En Face Image Quality Rating Sequence",
        "keyword":"OphthalmicEnFaceImageQualityRatingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221630":{
        "tag":"(0022,1630)",
        "name":"Quality Threshold",
        "keyword":"QualityThreshold",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00221640":{
        "tag":"(0022,1640)",
        "name":"OCT B-scan Analysis Acquisition Parameters Sequence",
        "keyword":"OCTBscanAnalysisAcquisitionParametersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00221642":{
        "tag":"(0022,1642)",
        "name":"Number of B-scans Per Frame",
        "keyword":"NumberofBscansPerFrame",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00221643":{
        "tag":"(0022,1643)",
        "name":"B-scan Slab Thickness",
        "keyword":"BscanSlabThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221644":{
        "tag":"(0022,1644)",
        "name":"Distance Between B-scan Slabs",
        "keyword":"DistanceBetweenBscanSlabs",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221645":{
        "tag":"(0022,1645)",
        "name":"B-scan Cycle Time",
        "keyword":"BscanCycleTime",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221646":{
        "tag":"(0022,1646)",
        "name":"B-scan Cycle Time Vector",
        "keyword":"BscanCycleTimeVector",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "00221649":{
        "tag":"(0022,1649)",
        "name":"A-scan Rate",
        "keyword":"AscanRate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221650":{
        "tag":"(0022,1650)",
        "name":"B-scan Rate",
        "keyword":"BscanRate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00221658":{
        "tag":"(0022,1658)",
        "name":"Surface Mesh Z-Pixel Offset",
        "keyword":"SurfaceMeshZPixelOffset",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00240010":{
        "tag":"(0024,0010)",
        "name":"Visual Field Horizontal Extent",
        "keyword":"VisualFieldHorizontalExtent",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240011":{
        "tag":"(0024,0011)",
        "name":"Visual Field Vertical Extent",
        "keyword":"VisualFieldVerticalExtent",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240012":{
        "tag":"(0024,0012)",
        "name":"Visual Field Shape",
        "keyword":"VisualFieldShape",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240016":{
        "tag":"(0024,0016)",
        "name":"Screening Test Mode Code Sequence",
        "keyword":"ScreeningTestModeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240018":{
        "tag":"(0024,0018)",
        "name":"Maximum Stimulus Luminance",
        "keyword":"MaximumStimulusLuminance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240020":{
        "tag":"(0024,0020)",
        "name":"Background Luminance",
        "keyword":"BackgroundLuminance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240021":{
        "tag":"(0024,0021)",
        "name":"Stimulus Color Code Sequence",
        "keyword":"StimulusColorCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240024":{
        "tag":"(0024,0024)",
        "name":"Background Illumination Color Code Sequence",
        "keyword":"BackgroundIlluminationColorCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240025":{
        "tag":"(0024,0025)",
        "name":"Stimulus Area",
        "keyword":"StimulusArea",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240028":{
        "tag":"(0024,0028)",
        "name":"Stimulus Presentation Time",
        "keyword":"StimulusPresentationTime",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240032":{
        "tag":"(0024,0032)",
        "name":"Fixation Sequence",
        "keyword":"FixationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240033":{
        "tag":"(0024,0033)",
        "name":"Fixation Monitoring Code Sequence",
        "keyword":"FixationMonitoringCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240034":{
        "tag":"(0024,0034)",
        "name":"Visual Field Catch Trial Sequence",
        "keyword":"VisualFieldCatchTrialSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240035":{
        "tag":"(0024,0035)",
        "name":"Fixation Checked Quantity",
        "keyword":"FixationCheckedQuantity",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00240036":{
        "tag":"(0024,0036)",
        "name":"Patient Not Properly Fixated Quantity",
        "keyword":"PatientNotProperlyFixatedQuantity",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00240037":{
        "tag":"(0024,0037)",
        "name":"Presented Visual Stimuli Data Flag",
        "keyword":"PresentedVisualStimuliDataFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240038":{
        "tag":"(0024,0038)",
        "name":"Number of Visual Stimuli",
        "keyword":"NumberOfVisualStimuli",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00240039":{
        "tag":"(0024,0039)",
        "name":"Excessive Fixation Losses Data Flag",
        "keyword":"ExcessiveFixationLossesDataFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240040":{
        "tag":"(0024,0040)",
        "name":"Excessive Fixation Losses",
        "keyword":"ExcessiveFixationLosses",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240042":{
        "tag":"(0024,0042)",
        "name":"Stimuli Retesting Quantity",
        "keyword":"StimuliRetestingQuantity",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00240044":{
        "tag":"(0024,0044)",
        "name":"Comments on Patient's Performance of Visual Field",
        "keyword":"CommentsOnPatientPerformanceOfVisualField",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00240045":{
        "tag":"(0024,0045)",
        "name":"False Negatives Estimate Flag",
        "keyword":"FalseNegativesEstimateFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240046":{
        "tag":"(0024,0046)",
        "name":"False Negatives Estimate",
        "keyword":"FalseNegativesEstimate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240048":{
        "tag":"(0024,0048)",
        "name":"Negative Catch Trials Quantity",
        "keyword":"NegativeCatchTrialsQuantity",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00240050":{
        "tag":"(0024,0050)",
        "name":"False Negatives Quantity",
        "keyword":"FalseNegativesQuantity",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00240051":{
        "tag":"(0024,0051)",
        "name":"Excessive False Negatives Data Flag",
        "keyword":"ExcessiveFalseNegativesDataFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240052":{
        "tag":"(0024,0052)",
        "name":"Excessive False Negatives",
        "keyword":"ExcessiveFalseNegatives",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240053":{
        "tag":"(0024,0053)",
        "name":"False Positives Estimate Flag",
        "keyword":"FalsePositivesEstimateFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240054":{
        "tag":"(0024,0054)",
        "name":"False Positives Estimate",
        "keyword":"FalsePositivesEstimate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240055":{
        "tag":"(0024,0055)",
        "name":"Catch Trials Data Flag",
        "keyword":"CatchTrialsDataFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240056":{
        "tag":"(0024,0056)",
        "name":"Positive Catch Trials Quantity",
        "keyword":"PositiveCatchTrialsQuantity",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00240057":{
        "tag":"(0024,0057)",
        "name":"Test Point Normals Data Flag",
        "keyword":"TestPointNormalsDataFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240058":{
        "tag":"(0024,0058)",
        "name":"Test Point Normals Sequence",
        "keyword":"TestPointNormalsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240059":{
        "tag":"(0024,0059)",
        "name":"Global Deviation Probability Normals Flag",
        "keyword":"GlobalDeviationProbabilityNormalsFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240060":{
        "tag":"(0024,0060)",
        "name":"False Positives Quantity",
        "keyword":"FalsePositivesQuantity",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00240061":{
        "tag":"(0024,0061)",
        "name":"Excessive False Positives Data Flag",
        "keyword":"ExcessiveFalsePositivesDataFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240062":{
        "tag":"(0024,0062)",
        "name":"Excessive False Positives",
        "keyword":"ExcessiveFalsePositives",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240063":{
        "tag":"(0024,0063)",
        "name":"Visual Field Test Normals Flag",
        "keyword":"VisualFieldTestNormalsFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240064":{
        "tag":"(0024,0064)",
        "name":"Results Normals Sequence",
        "keyword":"ResultsNormalsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240065":{
        "tag":"(0024,0065)",
        "name":"Age Corrected Sensitivity Deviation Algorithm Sequence",
        "keyword":"AgeCorrectedSensitivityDeviationAlgorithmSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240066":{
        "tag":"(0024,0066)",
        "name":"Global Deviation From Normal",
        "keyword":"GlobalDeviationFromNormal",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240067":{
        "tag":"(0024,0067)",
        "name":"Generalized Defect Sensitivity Deviation Algorithm Sequence",
        "keyword":"GeneralizedDefectSensitivityDeviationAlgorithmSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240068":{
        "tag":"(0024,0068)",
        "name":"Localized Deviation From Normal",
        "keyword":"LocalizedDeviationFromNormal",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240069":{
        "tag":"(0024,0069)",
        "name":"Patient Reliability Indicator",
        "keyword":"PatientReliabilityIndicator",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00240070":{
        "tag":"(0024,0070)",
        "name":"Visual Field Mean Sensitivity",
        "keyword":"VisualFieldMeanSensitivity",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240071":{
        "tag":"(0024,0071)",
        "name":"Global Deviation Probability",
        "keyword":"GlobalDeviationProbability",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240072":{
        "tag":"(0024,0072)",
        "name":"Local Deviation Probability Normals Flag",
        "keyword":"LocalDeviationProbabilityNormalsFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240073":{
        "tag":"(0024,0073)",
        "name":"Localized Deviation Probability",
        "keyword":"LocalizedDeviationProbability",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240074":{
        "tag":"(0024,0074)",
        "name":"Short Term Fluctuation Calculated",
        "keyword":"ShortTermFluctuationCalculated",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240075":{
        "tag":"(0024,0075)",
        "name":"Short Term Fluctuation",
        "keyword":"ShortTermFluctuation",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240076":{
        "tag":"(0024,0076)",
        "name":"Short Term Fluctuation Probability Calculated",
        "keyword":"ShortTermFluctuationProbabilityCalculated",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240077":{
        "tag":"(0024,0077)",
        "name":"Short Term Fluctuation Probability",
        "keyword":"ShortTermFluctuationProbability",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240078":{
        "tag":"(0024,0078)",
        "name":"Corrected Localized Deviation From Normal Calculated",
        "keyword":"CorrectedLocalizedDeviationFromNormalCalculated",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240079":{
        "tag":"(0024,0079)",
        "name":"Corrected Localized Deviation From Normal",
        "keyword":"CorrectedLocalizedDeviationFromNormal",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240080":{
        "tag":"(0024,0080)",
        "name":"Corrected Localized Deviation From Normal Probability Calculated",
        "keyword":"CorrectedLocalizedDeviationFromNormalProbabilityCalculated",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240081":{
        "tag":"(0024,0081)",
        "name":"Corrected Localized Deviation From Normal Probability",
        "keyword":"CorrectedLocalizedDeviationFromNormalProbability",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240083":{
        "tag":"(0024,0083)",
        "name":"Global Deviation Probability Sequence",
        "keyword":"GlobalDeviationProbabilitySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240085":{
        "tag":"(0024,0085)",
        "name":"Localized Deviation Probability Sequence",
        "keyword":"LocalizedDeviationProbabilitySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240086":{
        "tag":"(0024,0086)",
        "name":"Foveal Sensitivity Measured",
        "keyword":"FovealSensitivityMeasured",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240087":{
        "tag":"(0024,0087)",
        "name":"Foveal Sensitivity",
        "keyword":"FovealSensitivity",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240088":{
        "tag":"(0024,0088)",
        "name":"Visual Field Test Duration",
        "keyword":"VisualFieldTestDuration",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240089":{
        "tag":"(0024,0089)",
        "name":"Visual Field Test Point Sequence",
        "keyword":"VisualFieldTestPointSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240090":{
        "tag":"(0024,0090)",
        "name":"Visual Field Test Point X-Coordinate",
        "keyword":"VisualFieldTestPointXCoordinate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240091":{
        "tag":"(0024,0091)",
        "name":"Visual Field Test Point Y-Coordinate",
        "keyword":"VisualFieldTestPointYCoordinate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240092":{
        "tag":"(0024,0092)",
        "name":"Age Corrected Sensitivity Deviation Value",
        "keyword":"AgeCorrectedSensitivityDeviationValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240093":{
        "tag":"(0024,0093)",
        "name":"Stimulus Results",
        "keyword":"StimulusResults",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240094":{
        "tag":"(0024,0094)",
        "name":"Sensitivity Value",
        "keyword":"SensitivityValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240095":{
        "tag":"(0024,0095)",
        "name":"Retest Stimulus Seen",
        "keyword":"RetestStimulusSeen",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240096":{
        "tag":"(0024,0096)",
        "name":"Retest Sensitivity Value",
        "keyword":"RetestSensitivityValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240097":{
        "tag":"(0024,0097)",
        "name":"Visual Field Test Point Normals Sequence",
        "keyword":"VisualFieldTestPointNormalsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240098":{
        "tag":"(0024,0098)",
        "name":"Quantified Defect",
        "keyword":"QuantifiedDefect",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240100":{
        "tag":"(0024,0100)",
        "name":"Age Corrected Sensitivity Deviation Probability Value",
        "keyword":"AgeCorrectedSensitivityDeviationProbabilityValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240102":{
        "tag":"(0024,0102)",
        "name":"Generalized Defect Corrected Sensitivity Deviation Flag",
        "keyword":"GeneralizedDefectCorrectedSensitivityDeviationFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240103":{
        "tag":"(0024,0103)",
        "name":"Generalized Defect Corrected Sensitivity Deviation Value",
        "keyword":"GeneralizedDefectCorrectedSensitivityDeviationValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240104":{
        "tag":"(0024,0104)",
        "name":"Generalized Defect Corrected Sensitivity Deviation Probability Value",
        "keyword":"GeneralizedDefectCorrectedSensitivityDeviationProbabilityValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240105":{
        "tag":"(0024,0105)",
        "name":"Minimum Sensitivity Value",
        "keyword":"MinimumSensitivityValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240106":{
        "tag":"(0024,0106)",
        "name":"Blind Spot Localized",
        "keyword":"BlindSpotLocalized",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240107":{
        "tag":"(0024,0107)",
        "name":"Blind Spot X-Coordinate",
        "keyword":"BlindSpotXCoordinate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240108":{
        "tag":"(0024,0108)",
        "name":"Blind Spot Y-Coordinate",
        "keyword":"BlindSpotYCoordinate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240110":{
        "tag":"(0024,0110)",
        "name":"Visual Acuity Measurement Sequence",
        "keyword":"VisualAcuityMeasurementSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240112":{
        "tag":"(0024,0112)",
        "name":"Refractive Parameters Used on Patient Sequence",
        "keyword":"RefractiveParametersUsedOnPatientSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240113":{
        "tag":"(0024,0113)",
        "name":"Measurement Laterality",
        "keyword":"MeasurementLaterality",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240114":{
        "tag":"(0024,0114)",
        "name":"Ophthalmic Patient Clinical Information Left Eye Sequence",
        "keyword":"OphthalmicPatientClinicalInformationLeftEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240115":{
        "tag":"(0024,0115)",
        "name":"Ophthalmic Patient Clinical Information Right Eye Sequence",
        "keyword":"OphthalmicPatientClinicalInformationRightEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240117":{
        "tag":"(0024,0117)",
        "name":"Foveal Point Normative Data Flag",
        "keyword":"FovealPointNormativeDataFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240118":{
        "tag":"(0024,0118)",
        "name":"Foveal Point Probability Value",
        "keyword":"FovealPointProbabilityValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240120":{
        "tag":"(0024,0120)",
        "name":"Screening Baseline Measured",
        "keyword":"ScreeningBaselineMeasured",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240122":{
        "tag":"(0024,0122)",
        "name":"Screening Baseline Measured Sequence",
        "keyword":"ScreeningBaselineMeasuredSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240124":{
        "tag":"(0024,0124)",
        "name":"Screening Baseline Type",
        "keyword":"ScreeningBaselineType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240126":{
        "tag":"(0024,0126)",
        "name":"Screening Baseline Value",
        "keyword":"ScreeningBaselineValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240202":{
        "tag":"(0024,0202)",
        "name":"Algorithm Source",
        "keyword":"AlgorithmSource",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00240306":{
        "tag":"(0024,0306)",
        "name":"Data Set Name",
        "keyword":"DataSetName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00240307":{
        "tag":"(0024,0307)",
        "name":"Data Set Version",
        "keyword":"DataSetVersion",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00240308":{
        "tag":"(0024,0308)",
        "name":"Data Set Source",
        "keyword":"DataSetSource",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00240309":{
        "tag":"(0024,0309)",
        "name":"Data Set Description",
        "keyword":"DataSetDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00240317":{
        "tag":"(0024,0317)",
        "name":"Visual Field Test Reliability Global Index Sequence",
        "keyword":"VisualFieldTestReliabilityGlobalIndexSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240320":{
        "tag":"(0024,0320)",
        "name":"Visual Field Global Results Index Sequence",
        "keyword":"VisualFieldGlobalResultsIndexSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240325":{
        "tag":"(0024,0325)",
        "name":"Data Observation Sequence",
        "keyword":"DataObservationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00240338":{
        "tag":"(0024,0338)",
        "name":"Index Normals Flag",
        "keyword":"IndexNormalsFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00240341":{
        "tag":"(0024,0341)",
        "name":"Index Probability",
        "keyword":"IndexProbability",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00240344":{
        "tag":"(0024,0344)",
        "name":"Index Probability Sequence",
        "keyword":"IndexProbabilitySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00280002":{
        "tag":"(0028,0002)",
        "name":"Samples per Pixel",
        "keyword":"SamplesPerPixel",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00280003":{
        "tag":"(0028,0003)",
        "name":"Samples per Pixel Used",
        "keyword":"SamplesPerPixelUsed",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00280004":{
        "tag":"(0028,0004)",
        "name":"Photometric Interpretation",
        "keyword":"PhotometricInterpretation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00280005":{
        "tag":"(0028,0005)",
        "name":"Image Dimensions",
        "keyword":"ImageDimensions",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280006":{
        "tag":"(0028,0006)",
        "name":"Planar Configuration",
        "keyword":"PlanarConfiguration",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00280008":{
        "tag":"(0028,0008)",
        "name":"Number of Frames",
        "keyword":"NumberOfFrames",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00280009":{
        "tag":"(0028,0009)",
        "name":"Frame Increment Pointer",
        "keyword":"FrameIncrementPointer",
        "vr":"AT",
        "vm":"1-n",
        "retired":false
    },
    "0028000A":{
        "tag":"(0028,000A)",
        "name":"Frame Dimension Pointer",
        "keyword":"FrameDimensionPointer",
        "vr":"AT",
        "vm":"1-n",
        "retired":false
    },
    "00280010":{
        "tag":"(0028,0010)",
        "name":"Rows",
        "keyword":"Rows",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00280011":{
        "tag":"(0028,0011)",
        "name":"Columns",
        "keyword":"Columns",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00280012":{
        "tag":"(0028,0012)",
        "name":"Planes",
        "keyword":"Planes",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280014":{
        "tag":"(0028,0014)",
        "name":"Ultrasound Color Data Present",
        "keyword":"UltrasoundColorDataPresent",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00280020":{
        "tag":"(0028,0020)",
        "name":"",
        "keyword":"",
        "vr":"",
        "vm":"",
        "retired":false
    },
    "00280030":{
        "tag":"(0028,0030)",
        "name":"Pixel Spacing",
        "keyword":"PixelSpacing",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "00280031":{
        "tag":"(0028,0031)",
        "name":"Zoom Factor",
        "keyword":"ZoomFactor",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "00280032":{
        "tag":"(0028,0032)",
        "name":"Zoom Center",
        "keyword":"ZoomCenter",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "00280034":{
        "tag":"(0028,0034)",
        "name":"Pixel Aspect Ratio",
        "keyword":"PixelAspectRatio",
        "vr":"IS",
        "vm":"2",
        "retired":false
    },
    "00280040":{
        "tag":"(0028,0040)",
        "name":"Image Format",
        "keyword":"ImageFormat",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00280050":{
        "tag":"(0028,0050)",
        "name":"Manipulated Image",
        "keyword":"ManipulatedImage",
        "vr":"LO",
        "vm":"1-n",
        "retired":true
    },
    "00280051":{
        "tag":"(0028,0051)",
        "name":"Corrected Image",
        "keyword":"CorrectedImage",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "0028005F":{
        "tag":"(0028,005F)",
        "name":"Compression Recognition Code",
        "keyword":"CompressionRecognitionCode",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00280060":{
        "tag":"(0028,0060)",
        "name":"Compression Code",
        "keyword":"CompressionCode",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00280061":{
        "tag":"(0028,0061)",
        "name":"Compression Originator",
        "keyword":"CompressionOriginator",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "00280062":{
        "tag":"(0028,0062)",
        "name":"Compression Label",
        "keyword":"CompressionLabel",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00280063":{
        "tag":"(0028,0063)",
        "name":"Compression Description",
        "keyword":"CompressionDescription",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "00280065":{
        "tag":"(0028,0065)",
        "name":"Compression Sequence",
        "keyword":"CompressionSequence",
        "vr":"CS",
        "vm":"1-n",
        "retired":true
    },
    "00280066":{
        "tag":"(0028,0066)",
        "name":"Compression Step Pointers",
        "keyword":"CompressionStepPointers",
        "vr":"AT",
        "vm":"1-n",
        "retired":true
    },
    "00280068":{
        "tag":"(0028,0068)",
        "name":"Repeat Interval",
        "keyword":"RepeatInterval",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280069":{
        "tag":"(0028,0069)",
        "name":"Bits Grouped",
        "keyword":"BitsGrouped",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280070":{
        "tag":"(0028,0070)",
        "name":"Perimeter Table",
        "keyword":"PerimeterTable",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "00280071":{
        "tag":"(0028,0071)",
        "name":"Perimeter Value",
        "keyword":"PerimeterValue",
        "vr":"US or SS",
        "vm":"1",
        "retired":true
    },
    "00280080":{
        "tag":"(0028,0080)",
        "name":"Predictor Rows",
        "keyword":"PredictorRows",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280081":{
        "tag":"(0028,0081)",
        "name":"Predictor Columns",
        "keyword":"PredictorColumns",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280082":{
        "tag":"(0028,0082)",
        "name":"Predictor Constants",
        "keyword":"PredictorConstants",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "00280090":{
        "tag":"(0028,0090)",
        "name":"Blocked Pixels",
        "keyword":"BlockedPixels",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00280091":{
        "tag":"(0028,0091)",
        "name":"Block Rows",
        "keyword":"BlockRows",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280092":{
        "tag":"(0028,0092)",
        "name":"Block Columns",
        "keyword":"BlockColumns",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280093":{
        "tag":"(0028,0093)",
        "name":"Row Overlap",
        "keyword":"RowOverlap",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280094":{
        "tag":"(0028,0094)",
        "name":"Column Overlap",
        "keyword":"ColumnOverlap",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280100":{
        "tag":"(0028,0100)",
        "name":"Bits Allocated",
        "keyword":"BitsAllocated",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00280101":{
        "tag":"(0028,0101)",
        "name":"Bits Stored",
        "keyword":"BitsStored",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00280102":{
        "tag":"(0028,0102)",
        "name":"High Bit",
        "keyword":"HighBit",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00280103":{
        "tag":"(0028,0103)",
        "name":"Pixel Representation",
        "keyword":"PixelRepresentation",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00280104":{
        "tag":"(0028,0104)",
        "name":"Smallest Valid Pixel Value",
        "keyword":"SmallestValidPixelValue",
        "vr":"US or SS",
        "vm":"1",
        "retired":true
    },
    "00280105":{
        "tag":"(0028,0105)",
        "name":"Largest Valid Pixel Value",
        "keyword":"LargestValidPixelValue",
        "vr":"US or SS",
        "vm":"1",
        "retired":true
    },
    "00280106":{
        "tag":"(0028,0106)",
        "name":"Smallest Image Pixel Value",
        "keyword":"SmallestImagePixelValue",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00280107":{
        "tag":"(0028,0107)",
        "name":"Largest Image Pixel Value",
        "keyword":"LargestImagePixelValue",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00280108":{
        "tag":"(0028,0108)",
        "name":"Smallest Pixel Value in Series",
        "keyword":"SmallestPixelValueInSeries",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00280109":{
        "tag":"(0028,0109)",
        "name":"Largest Pixel Value in Series",
        "keyword":"LargestPixelValueInSeries",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00280110":{
        "tag":"(0028,0110)",
        "name":"Smallest Image Pixel Value in Plane",
        "keyword":"SmallestImagePixelValueInPlane",
        "vr":"US or SS",
        "vm":"1",
        "retired":true
    },
    "00280111":{
        "tag":"(0028,0111)",
        "name":"Largest Image Pixel Value in Plane",
        "keyword":"LargestImagePixelValueInPlane",
        "vr":"US or SS",
        "vm":"1",
        "retired":true
    },
    "00280120":{
        "tag":"(0028,0120)",
        "name":"Pixel Padding Value",
        "keyword":"PixelPaddingValue",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00280121":{
        "tag":"(0028,0121)",
        "name":"Pixel Padding Range Limit",
        "keyword":"PixelPaddingRangeLimit",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00280122":{
        "tag":"(0028,0122)",
        "name":"Float Pixel Padding Value",
        "keyword":"FloatPixelPaddingValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00280123":{
        "tag":"(0028,0123)",
        "name":"Double Float Pixel Padding Value",
        "keyword":"DoubleFloatPixelPaddingValue",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00280124":{
        "tag":"(0028,0124)",
        "name":"Float Pixel Padding Range Limit",
        "keyword":"FloatPixelPaddingRangeLimit",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00280125":{
        "tag":"(0028,0125)",
        "name":"Double Float Pixel Padding Range Limit",
        "keyword":"DoubleFloatPixelPaddingRangeLimit",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00280200":{
        "tag":"(0028,0200)",
        "name":"Image Location",
        "keyword":"ImageLocation",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280300":{
        "tag":"(0028,0300)",
        "name":"Quality Control Image",
        "keyword":"QualityControlImage",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00280301":{
        "tag":"(0028,0301)",
        "name":"Burned In Annotation",
        "keyword":"BurnedInAnnotation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00280302":{
        "tag":"(0028,0302)",
        "name":"Recognizable Visual Features",
        "keyword":"RecognizableVisualFeatures",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00280303":{
        "tag":"(0028,0303)",
        "name":"Longitudinal Temporal Information Modified",
        "keyword":"LongitudinalTemporalInformationModified",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00280304":{
        "tag":"(0028,0304)",
        "name":"Referenced Color Palette Instance UID",
        "keyword":"ReferencedColorPaletteInstanceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00280400":{
        "tag":"(0028,0400)",
        "name":"Transform Label",
        "keyword":"TransformLabel",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00280401":{
        "tag":"(0028,0401)",
        "name":"Transform Version Number",
        "keyword":"TransformVersionNumber",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00280402":{
        "tag":"(0028,0402)",
        "name":"Number of Transform Steps",
        "keyword":"NumberOfTransformSteps",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280403":{
        "tag":"(0028,0403)",
        "name":"Sequence of Compressed Data",
        "keyword":"SequenceOfCompressedData",
        "vr":"LO",
        "vm":"1-n",
        "retired":true
    },
    "00280404":{
        "tag":"(0028,0404)",
        "name":"Details of Coefficients",
        "keyword":"DetailsOfCoefficients",
        "vr":"AT",
        "vm":"1-n",
        "retired":true
    },
    "002804X0":{
        "tag":"(0028,04X0)",
        "name":"Rows For Nth Order Coefficients",
        "keyword":"RowsForNthOrderCoefficients",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "002804X1":{
        "tag":"(0028,04X1)",
        "name":"Columns For Nth Order Coefficients",
        "keyword":"ColumnsForNthOrderCoefficients",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "002804X2":{
        "tag":"(0028,04X2)",
        "name":"Coefficient Coding",
        "keyword":"CoefficientCoding",
        "vr":"LO",
        "vm":"1-n",
        "retired":true
    },
    "002804X3":{
        "tag":"(0028,04X3)",
        "name":"Coefficient Coding Pointers",
        "keyword":"CoefficientCodingPointers",
        "vr":"AT",
        "vm":"1-n",
        "retired":true
    },
    "00280700":{
        "tag":"(0028,0700)",
        "name":"DCT Label",
        "keyword":"DCTLabel",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00280701":{
        "tag":"(0028,0701)",
        "name":"Data Block Description",
        "keyword":"DataBlockDescription",
        "vr":"CS",
        "vm":"1-n",
        "retired":true
    },
    "00280702":{
        "tag":"(0028,0702)",
        "name":"Data Block",
        "keyword":"DataBlock",
        "vr":"AT",
        "vm":"1-n",
        "retired":true
    },
    "00280710":{
        "tag":"(0028,0710)",
        "name":"Normalization Factor Format",
        "keyword":"NormalizationFactorFormat",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280720":{
        "tag":"(0028,0720)",
        "name":"Zonal Map Number Format",
        "keyword":"ZonalMapNumberFormat",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280721":{
        "tag":"(0028,0721)",
        "name":"Zonal Map Location",
        "keyword":"ZonalMapLocation",
        "vr":"AT",
        "vm":"1-n",
        "retired":true
    },
    "00280722":{
        "tag":"(0028,0722)",
        "name":"Zonal Map Format",
        "keyword":"ZonalMapFormat",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280730":{
        "tag":"(0028,0730)",
        "name":"Adaptive Map Format",
        "keyword":"AdaptiveMapFormat",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00280740":{
        "tag":"(0028,0740)",
        "name":"Code Number Format",
        "keyword":"CodeNumberFormat",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "002808X0":{
        "tag":"(0028,08X0)",
        "name":"Code Label",
        "keyword":"CodeLabel",
        "vr":"CS",
        "vm":"1-n",
        "retired":true
    },
    "002808X2":{
        "tag":"(0028,08X2)",
        "name":"Number of Tables",
        "keyword":"NumberOfTables",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "002808X3":{
        "tag":"(0028,08X3)",
        "name":"Code Table Location",
        "keyword":"CodeTableLocation",
        "vr":"AT",
        "vm":"1-n",
        "retired":true
    },
    "002808X4":{
        "tag":"(0028,08X4)",
        "name":"Bits For Code Word",
        "keyword":"BitsForCodeWord",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "002808X8":{
        "tag":"(0028,08X8)",
        "name":"Image Data Location",
        "keyword":"ImageDataLocation",
        "vr":"AT",
        "vm":"1-n",
        "retired":true
    },
    "00280A02":{
        "tag":"(0028,0A02)",
        "name":"Pixel Spacing Calibration Type",
        "keyword":"PixelSpacingCalibrationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00280A04":{
        "tag":"(0028,0A04)",
        "name":"Pixel Spacing Calibration Description",
        "keyword":"PixelSpacingCalibrationDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00281040":{
        "tag":"(0028,1040)",
        "name":"Pixel Intensity Relationship",
        "keyword":"PixelIntensityRelationship",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00281041":{
        "tag":"(0028,1041)",
        "name":"Pixel Intensity Relationship Sign",
        "keyword":"PixelIntensityRelationshipSign",
        "vr":"SS",
        "vm":"1",
        "retired":false
    },
    "00281050":{
        "tag":"(0028,1050)",
        "name":"Window Center",
        "keyword":"WindowCenter",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00281051":{
        "tag":"(0028,1051)",
        "name":"Window Width",
        "keyword":"WindowWidth",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00281052":{
        "tag":"(0028,1052)",
        "name":"Rescale Intercept",
        "keyword":"RescaleIntercept",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00281053":{
        "tag":"(0028,1053)",
        "name":"Rescale Slope",
        "keyword":"RescaleSlope",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00281054":{
        "tag":"(0028,1054)",
        "name":"Rescale Type",
        "keyword":"RescaleType",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00281055":{
        "tag":"(0028,1055)",
        "name":"Window Center & Width Explanation",
        "keyword":"WindowCenterWidthExplanation",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00281056":{
        "tag":"(0028,1056)",
        "name":"VOI LUT Function",
        "keyword":"VOILUTFunction",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00281080":{
        "tag":"(0028,1080)",
        "name":"Gray Scale",
        "keyword":"GrayScale",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00281090":{
        "tag":"(0028,1090)",
        "name":"Recommended Viewing Mode",
        "keyword":"RecommendedViewingMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00281100":{
        "tag":"(0028,1100)",
        "name":"Gray Lookup Table Descriptor",
        "keyword":"GrayLookupTableDescriptor",
        "vr":"US or SS",
        "vm":"3",
        "retired":true
    },
    "00281101":{
        "tag":"(0028,1101)",
        "name":"Red Palette Color Lookup Table Descriptor",
        "keyword":"RedPaletteColorLookupTableDescriptor",
        "vr":"US or SS",
        "vm":"3",
        "retired":false
    },
    "00281102":{
        "tag":"(0028,1102)",
        "name":"Green Palette Color Lookup Table Descriptor",
        "keyword":"GreenPaletteColorLookupTableDescriptor",
        "vr":"US or SS",
        "vm":"3",
        "retired":false
    },
    "00281103":{
        "tag":"(0028,1103)",
        "name":"Blue Palette Color Lookup Table Descriptor",
        "keyword":"BluePaletteColorLookupTableDescriptor",
        "vr":"US or SS",
        "vm":"3",
        "retired":false
    },
    "00281104":{
        "tag":"(0028,1104)",
        "name":"Alpha Palette Color Lookup Table Descriptor",
        "keyword":"AlphaPaletteColorLookupTableDescriptor",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00281111":{
        "tag":"(0028,1111)",
        "name":"Large Red Palette Color Lookup Table Descriptor",
        "keyword":"LargeRedPaletteColorLookupTableDescriptor",
        "vr":"US or SS",
        "vm":"4",
        "retired":true
    },
    "00281112":{
        "tag":"(0028,1112)",
        "name":"Large Green Palette Color Lookup Table Descriptor",
        "keyword":"LargeGreenPaletteColorLookupTableDescriptor",
        "vr":"US or SS",
        "vm":"4",
        "retired":true
    },
    "00281113":{
        "tag":"(0028,1113)",
        "name":"Large Blue Palette Color Lookup Table Descriptor",
        "keyword":"LargeBluePaletteColorLookupTableDescriptor",
        "vr":"US or SS",
        "vm":"4",
        "retired":true
    },
    "00281199":{
        "tag":"(0028,1199)",
        "name":"Palette Color Lookup Table UID",
        "keyword":"PaletteColorLookupTableUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00281200":{
        "tag":"(0028,1200)",
        "name":"Gray Lookup Table Data",
        "keyword":"GrayLookupTableData",
        "vr":"US or SS or OW",
        "vm":"1-n or 1",
        "retired":true
    },
    "00281201":{
        "tag":"(0028,1201)",
        "name":"Red Palette Color Lookup Table Data",
        "keyword":"RedPaletteColorLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":false
    },
    "00281202":{
        "tag":"(0028,1202)",
        "name":"Green Palette Color Lookup Table Data",
        "keyword":"GreenPaletteColorLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":false
    },
    "00281203":{
        "tag":"(0028,1203)",
        "name":"Blue Palette Color Lookup Table Data",
        "keyword":"BluePaletteColorLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":false
    },
    "00281204":{
        "tag":"(0028,1204)",
        "name":"Alpha Palette Color Lookup Table Data",
        "keyword":"AlphaPaletteColorLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":false
    },
    "00281211":{
        "tag":"(0028,1211)",
        "name":"Large Red Palette Color Lookup Table Data",
        "keyword":"LargeRedPaletteColorLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "00281212":{
        "tag":"(0028,1212)",
        "name":"Large Green Palette Color Lookup Table Data",
        "keyword":"LargeGreenPaletteColorLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "00281213":{
        "tag":"(0028,1213)",
        "name":"Large Blue Palette Color Lookup Table Data",
        "keyword":"LargeBluePaletteColorLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "00281214":{
        "tag":"(0028,1214)",
        "name":"Large Palette Color Lookup Table UID",
        "keyword":"LargePaletteColorLookupTableUID",
        "vr":"UI",
        "vm":"1",
        "retired":true
    },
    "00281221":{
        "tag":"(0028,1221)",
        "name":"Segmented Red Palette Color Lookup Table Data",
        "keyword":"SegmentedRedPaletteColorLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":false
    },
    "00281222":{
        "tag":"(0028,1222)",
        "name":"Segmented Green Palette Color Lookup Table Data",
        "keyword":"SegmentedGreenPaletteColorLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":false
    },
    "00281223":{
        "tag":"(0028,1223)",
        "name":"Segmented Blue Palette Color Lookup Table Data",
        "keyword":"SegmentedBluePaletteColorLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":false
    },
    "00281224":{
        "tag":"(0028,1224)",
        "name":"Segmented Alpha Palette Color Lookup Table Data",
        "keyword":"SegmentedAlphaPaletteColorLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":false
    },
    "00281230":{
        "tag":"(0028,1230)",
        "name":"Stored Value Color Range Sequence",
        "keyword":"StoredValueColorRangeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00281231":{
        "tag":"(0028,1231)",
        "name":"Minimum Stored Value Mapped",
        "keyword":"MinimumStoredValueMapped",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00281232":{
        "tag":"(0028,1232)",
        "name":"Maximum Stored Value Mapped",
        "keyword":"MaximumStoredValueMapped",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00281300":{
        "tag":"(0028,1300)",
        "name":"Breast Implant Present",
        "keyword":"BreastImplantPresent",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00281350":{
        "tag":"(0028,1350)",
        "name":"Partial View",
        "keyword":"PartialView",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00281351":{
        "tag":"(0028,1351)",
        "name":"Partial View Description",
        "keyword":"PartialViewDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00281352":{
        "tag":"(0028,1352)",
        "name":"Partial View Code Sequence",
        "keyword":"PartialViewCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0028135A":{
        "tag":"(0028,135A)",
        "name":"Spatial Locations Preserved",
        "keyword":"SpatialLocationsPreserved",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00281401":{
        "tag":"(0028,1401)",
        "name":"Data Frame Assignment Sequence",
        "keyword":"DataFrameAssignmentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00281402":{
        "tag":"(0028,1402)",
        "name":"Data Path Assignment",
        "keyword":"DataPathAssignment",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00281403":{
        "tag":"(0028,1403)",
        "name":"Bits Mapped to Color Lookup Table",
        "keyword":"BitsMappedToColorLookupTable",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00281404":{
        "tag":"(0028,1404)",
        "name":"Blending LUT 1 Sequence",
        "keyword":"BlendingLUT1Sequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00281405":{
        "tag":"(0028,1405)",
        "name":"Blending LUT 1 Transfer Function",
        "keyword":"BlendingLUT1TransferFunction",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00281406":{
        "tag":"(0028,1406)",
        "name":"Blending Weight Constant",
        "keyword":"BlendingWeightConstant",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00281407":{
        "tag":"(0028,1407)",
        "name":"Blending Lookup Table Descriptor",
        "keyword":"BlendingLookupTableDescriptor",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00281408":{
        "tag":"(0028,1408)",
        "name":"Blending Lookup Table Data",
        "keyword":"BlendingLookupTableData",
        "vr":"OW",
        "vm":"1",
        "retired":false
    },
    "0028140B":{
        "tag":"(0028,140B)",
        "name":"Enhanced Palette Color Lookup Table Sequence",
        "keyword":"EnhancedPaletteColorLookupTableSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0028140C":{
        "tag":"(0028,140C)",
        "name":"Blending LUT 2 Sequence",
        "keyword":"BlendingLUT2Sequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0028140D":{
        "tag":"(0028,140D)",
        "name":"Blending LUT 2 Transfer Function",
        "keyword":"BlendingLUT2TransferFunction",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0028140E":{
        "tag":"(0028,140E)",
        "name":"Data Path ID",
        "keyword":"DataPathID",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0028140F":{
        "tag":"(0028,140F)",
        "name":"RGB LUT Transfer Function",
        "keyword":"RGBLUTTransferFunction",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00281410":{
        "tag":"(0028,1410)",
        "name":"Alpha LUT Transfer Function",
        "keyword":"AlphaLUTTransferFunction",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00282000":{
        "tag":"(0028,2000)",
        "name":"ICC Profile",
        "keyword":"ICCProfile",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "00282002":{
        "tag":"(0028,2002)",
        "name":"Color Space",
        "keyword":"ColorSpace",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00282110":{
        "tag":"(0028,2110)",
        "name":"Lossy Image Compression",
        "keyword":"LossyImageCompression",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00282112":{
        "tag":"(0028,2112)",
        "name":"Lossy Image Compression Ratio",
        "keyword":"LossyImageCompressionRatio",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00282114":{
        "tag":"(0028,2114)",
        "name":"Lossy Image Compression Method",
        "keyword":"LossyImageCompressionMethod",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00283000":{
        "tag":"(0028,3000)",
        "name":"Modality LUT Sequence",
        "keyword":"ModalityLUTSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00283002":{
        "tag":"(0028,3002)",
        "name":"LUT Descriptor",
        "keyword":"LUTDescriptor",
        "vr":"US or SS",
        "vm":"3",
        "retired":false
    },
    "00283003":{
        "tag":"(0028,3003)",
        "name":"LUT Explanation",
        "keyword":"LUTExplanation",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00283004":{
        "tag":"(0028,3004)",
        "name":"Modality LUT Type",
        "keyword":"ModalityLUTType",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00283006":{
        "tag":"(0028,3006)",
        "name":"LUT Data",
        "keyword":"LUTData",
        "vr":"US or OW",
        "vm":"1-n or 1",
        "retired":false
    },
    "00283010":{
        "tag":"(0028,3010)",
        "name":"VOI LUT Sequence",
        "keyword":"VOILUTSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00283110":{
        "tag":"(0028,3110)",
        "name":"Softcopy VOI LUT Sequence",
        "keyword":"SoftcopyVOILUTSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00284000":{
        "tag":"(0028,4000)",
        "name":"Image Presentation Comments",
        "keyword":"ImagePresentationComments",
        "vr":"LT",
        "vm":"1",
        "retired":true
    },
    "00285000":{
        "tag":"(0028,5000)",
        "name":"Bi-Plane Acquisition Sequence",
        "keyword":"BiPlaneAcquisitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00286010":{
        "tag":"(0028,6010)",
        "name":"Representative Frame Number",
        "keyword":"RepresentativeFrameNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00286020":{
        "tag":"(0028,6020)",
        "name":"Frame Numbers of Interest (FOI)",
        "keyword":"FrameNumbersOfInterest",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00286022":{
        "tag":"(0028,6022)",
        "name":"Frame of Interest Description",
        "keyword":"FrameOfInterestDescription",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00286023":{
        "tag":"(0028,6023)",
        "name":"Frame of Interest Type",
        "keyword":"FrameOfInterestType",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00286030":{
        "tag":"(0028,6030)",
        "name":"Mask Pointer(s)",
        "keyword":"MaskPointers",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "00286040":{
        "tag":"(0028,6040)",
        "name":"R Wave Pointer",
        "keyword":"RWavePointer",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00286100":{
        "tag":"(0028,6100)",
        "name":"Mask Subtraction Sequence",
        "keyword":"MaskSubtractionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00286101":{
        "tag":"(0028,6101)",
        "name":"Mask Operation",
        "keyword":"MaskOperation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00286102":{
        "tag":"(0028,6102)",
        "name":"Applicable Frame Range",
        "keyword":"ApplicableFrameRange",
        "vr":"US",
        "vm":"2-2n",
        "retired":false
    },
    "00286110":{
        "tag":"(0028,6110)",
        "name":"Mask Frame Numbers",
        "keyword":"MaskFrameNumbers",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00286112":{
        "tag":"(0028,6112)",
        "name":"Contrast Frame Averaging",
        "keyword":"ContrastFrameAveraging",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00286114":{
        "tag":"(0028,6114)",
        "name":"Mask Sub-pixel Shift",
        "keyword":"MaskSubPixelShift",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00286120":{
        "tag":"(0028,6120)",
        "name":"TID Offset",
        "keyword":"TIDOffset",
        "vr":"SS",
        "vm":"1",
        "retired":false
    },
    "00286190":{
        "tag":"(0028,6190)",
        "name":"Mask Operation Explanation",
        "keyword":"MaskOperationExplanation",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00287000":{
        "tag":"(0028,7000)",
        "name":"Equipment Administrator Sequence",
        "keyword":"EquipmentAdministratorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287001":{
        "tag":"(0028,7001)",
        "name":"Number of Display Subsystems",
        "keyword":"NumberOfDisplaySubsystems",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00287002":{
        "tag":"(0028,7002)",
        "name":"Current Configuration ID",
        "keyword":"CurrentConfigurationID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00287003":{
        "tag":"(0028,7003)",
        "name":"Display Subsystem ID",
        "keyword":"DisplaySubsystemID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00287004":{
        "tag":"(0028,7004)",
        "name":"Display Subsystem Name",
        "keyword":"DisplaySubsystemName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00287005":{
        "tag":"(0028,7005)",
        "name":"Display Subsystem Description",
        "keyword":"DisplaySubsystemDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00287006":{
        "tag":"(0028,7006)",
        "name":"System Status",
        "keyword":"SystemStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00287007":{
        "tag":"(0028,7007)",
        "name":"System Status Comment",
        "keyword":"SystemStatusComment",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00287008":{
        "tag":"(0028,7008)",
        "name":"Target Luminance Characteristics Sequence",
        "keyword":"TargetLuminanceCharacteristicsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287009":{
        "tag":"(0028,7009)",
        "name":"Luminance Characteristics ID",
        "keyword":"LuminanceCharacteristicsID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "0028700A":{
        "tag":"(0028,700A)",
        "name":"Display Subsystem Configuration Sequence",
        "keyword":"DisplaySubsystemConfigurationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0028700B":{
        "tag":"(0028,700B)",
        "name":"Configuration ID",
        "keyword":"ConfigurationID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "0028700C":{
        "tag":"(0028,700C)",
        "name":"Configuration Name",
        "keyword":"ConfigurationName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "0028700D":{
        "tag":"(0028,700D)",
        "name":"Configuration Description",
        "keyword":"ConfigurationDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0028700E":{
        "tag":"(0028,700E)",
        "name":"Referenced Target Luminance Characteristics ID",
        "keyword":"ReferencedTargetLuminanceCharacteristicsID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "0028700F":{
        "tag":"(0028,700F)",
        "name":"QA Results Sequence",
        "keyword":"QAResultsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287010":{
        "tag":"(0028,7010)",
        "name":"Display Subsystem QA Results Sequence",
        "keyword":"DisplaySubsystemQAResultsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287011":{
        "tag":"(0028,7011)",
        "name":"Configuration QA Results Sequence",
        "keyword":"ConfigurationQAResultsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287012":{
        "tag":"(0028,7012)",
        "name":"Measurement Equipment Sequence",
        "keyword":"MeasurementEquipmentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287013":{
        "tag":"(0028,7013)",
        "name":"Measurement Functions",
        "keyword":"MeasurementFunctions",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00287014":{
        "tag":"(0028,7014)",
        "name":"Measurement Equipment Type",
        "keyword":"MeasurementEquipmentType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00287015":{
        "tag":"(0028,7015)",
        "name":"Visual Evaluation Result Sequence",
        "keyword":"VisualEvaluationResultSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287016":{
        "tag":"(0028,7016)",
        "name":"Display Calibration Result Sequence",
        "keyword":"DisplayCalibrationResultSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287017":{
        "tag":"(0028,7017)",
        "name":"DDL Value",
        "keyword":"DDLValue",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00287018":{
        "tag":"(0028,7018)",
        "name":"CIExy White Point",
        "keyword":"CIExyWhitePoint",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00287019":{
        "tag":"(0028,7019)",
        "name":"Display Function Type",
        "keyword":"DisplayFunctionType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0028701A":{
        "tag":"(0028,701A)",
        "name":"Gamma Value",
        "keyword":"GammaValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "0028701B":{
        "tag":"(0028,701B)",
        "name":"Number of Luminance Points",
        "keyword":"NumberOfLuminancePoints",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "0028701C":{
        "tag":"(0028,701C)",
        "name":"Luminance Response Sequence",
        "keyword":"LuminanceResponseSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0028701D":{
        "tag":"(0028,701D)",
        "name":"Target Minimum Luminance",
        "keyword":"TargetMinimumLuminance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "0028701E":{
        "tag":"(0028,701E)",
        "name":"Target Maximum Luminance",
        "keyword":"TargetMaximumLuminance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "0028701F":{
        "tag":"(0028,701F)",
        "name":"Luminance Value",
        "keyword":"LuminanceValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00287020":{
        "tag":"(0028,7020)",
        "name":"Luminance Response Description",
        "keyword":"LuminanceResponseDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00287021":{
        "tag":"(0028,7021)",
        "name":"White Point Flag",
        "keyword":"WhitePointFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00287022":{
        "tag":"(0028,7022)",
        "name":"Display Device Type Code Sequence",
        "keyword":"DisplayDeviceTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287023":{
        "tag":"(0028,7023)",
        "name":"Display Subsystem Sequence",
        "keyword":"DisplaySubsystemSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287024":{
        "tag":"(0028,7024)",
        "name":"Luminance Result Sequence",
        "keyword":"LuminanceResultSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287025":{
        "tag":"(0028,7025)",
        "name":"Ambient Light Value Source",
        "keyword":"AmbientLightValueSource",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00287026":{
        "tag":"(0028,7026)",
        "name":"Measured Characteristics",
        "keyword":"MeasuredCharacteristics",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00287027":{
        "tag":"(0028,7027)",
        "name":"Luminance Uniformity Result Sequence",
        "keyword":"LuminanceUniformityResultSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287028":{
        "tag":"(0028,7028)",
        "name":"Visual Evaluation Test Sequence",
        "keyword":"VisualEvaluationTestSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287029":{
        "tag":"(0028,7029)",
        "name":"Test Result",
        "keyword":"TestResult",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0028702A":{
        "tag":"(0028,702A)",
        "name":"Test Result Comment",
        "keyword":"TestResultComment",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0028702B":{
        "tag":"(0028,702B)",
        "name":"Test Image Validation",
        "keyword":"TestImageValidation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0028702C":{
        "tag":"(0028,702C)",
        "name":"Test Pattern Code Sequence",
        "keyword":"TestPatternCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0028702D":{
        "tag":"(0028,702D)",
        "name":"Measurement Pattern Code Sequence",
        "keyword":"MeasurementPatternCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0028702E":{
        "tag":"(0028,702E)",
        "name":"Visual Evaluation Method Code Sequence",
        "keyword":"VisualEvaluationMethodCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00287FE0":{
        "tag":"(0028,7FE0)",
        "name":"Pixel Data Provider URL",
        "keyword":"PixelDataProviderURL",
        "vr":"UR",
        "vm":"1",
        "retired":false
    },
    "00289001":{
        "tag":"(0028,9001)",
        "name":"Data Point Rows",
        "keyword":"DataPointRows",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00289002":{
        "tag":"(0028,9002)",
        "name":"Data Point Columns",
        "keyword":"DataPointColumns",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00289003":{
        "tag":"(0028,9003)",
        "name":"Signal Domain Columns",
        "keyword":"SignalDomainColumns",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00289099":{
        "tag":"(0028,9099)",
        "name":"Largest Monochrome Pixel Value",
        "keyword":"LargestMonochromePixelValue",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00289108":{
        "tag":"(0028,9108)",
        "name":"Data Representation",
        "keyword":"DataRepresentation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00289110":{
        "tag":"(0028,9110)",
        "name":"Pixel Measures Sequence",
        "keyword":"PixelMeasuresSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00289132":{
        "tag":"(0028,9132)",
        "name":"Frame VOI LUT Sequence",
        "keyword":"FrameVOILUTSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00289145":{
        "tag":"(0028,9145)",
        "name":"Pixel Value Transformation Sequence",
        "keyword":"PixelValueTransformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00289235":{
        "tag":"(0028,9235)",
        "name":"Signal Domain Rows",
        "keyword":"SignalDomainRows",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00289411":{
        "tag":"(0028,9411)",
        "name":"Display Filter Percentage",
        "keyword":"DisplayFilterPercentage",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00289415":{
        "tag":"(0028,9415)",
        "name":"Frame Pixel Shift Sequence",
        "keyword":"FramePixelShiftSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00289416":{
        "tag":"(0028,9416)",
        "name":"Subtraction Item ID",
        "keyword":"SubtractionItemID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00289422":{
        "tag":"(0028,9422)",
        "name":"Pixel Intensity Relationship LUT Sequence",
        "keyword":"PixelIntensityRelationshipLUTSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00289443":{
        "tag":"(0028,9443)",
        "name":"Frame Pixel Data Properties Sequence",
        "keyword":"FramePixelDataPropertiesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00289444":{
        "tag":"(0028,9444)",
        "name":"Geometrical Properties",
        "keyword":"GeometricalProperties",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00289445":{
        "tag":"(0028,9445)",
        "name":"Geometric Maximum Distortion",
        "keyword":"GeometricMaximumDistortion",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00289446":{
        "tag":"(0028,9446)",
        "name":"Image Processing Applied",
        "keyword":"ImageProcessingApplied",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00289454":{
        "tag":"(0028,9454)",
        "name":"Mask Selection Mode",
        "keyword":"MaskSelectionMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00289474":{
        "tag":"(0028,9474)",
        "name":"LUT Function",
        "keyword":"LUTFunction",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00289478":{
        "tag":"(0028,9478)",
        "name":"Mask Visibility Percentage",
        "keyword":"MaskVisibilityPercentage",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00289501":{
        "tag":"(0028,9501)",
        "name":"Pixel Shift Sequence",
        "keyword":"PixelShiftSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00289502":{
        "tag":"(0028,9502)",
        "name":"Region Pixel Shift Sequence",
        "keyword":"RegionPixelShiftSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00289503":{
        "tag":"(0028,9503)",
        "name":"Vertices of the Region",
        "keyword":"VerticesOfTheRegion",
        "vr":"SS",
        "vm":"2-2n",
        "retired":false
    },
    "00289505":{
        "tag":"(0028,9505)",
        "name":"Multi-frame Presentation Sequence",
        "keyword":"MultiFramePresentationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00289506":{
        "tag":"(0028,9506)",
        "name":"Pixel Shift Frame Range",
        "keyword":"PixelShiftFrameRange",
        "vr":"US",
        "vm":"2-2n",
        "retired":false
    },
    "00289507":{
        "tag":"(0028,9507)",
        "name":"LUT Frame Range",
        "keyword":"LUTFrameRange",
        "vr":"US",
        "vm":"2-2n",
        "retired":false
    },
    "00289520":{
        "tag":"(0028,9520)",
        "name":"Image to Equipment Mapping Matrix",
        "keyword":"ImageToEquipmentMappingMatrix",
        "vr":"DS",
        "vm":"16",
        "retired":false
    },
    "00289537":{
        "tag":"(0028,9537)",
        "name":"Equipment Coordinate System Identification",
        "keyword":"EquipmentCoordinateSystemIdentification",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0032000A":{
        "tag":"(0032,000A)",
        "name":"Study Status ID",
        "keyword":"StudyStatusID",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0032000C":{
        "tag":"(0032,000C)",
        "name":"Study Priority ID",
        "keyword":"StudyPriorityID",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00320012":{
        "tag":"(0032,0012)",
        "name":"Study ID Issuer",
        "keyword":"StudyIDIssuer",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00320032":{
        "tag":"(0032,0032)",
        "name":"Study Verified Date",
        "keyword":"StudyVerifiedDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "00320033":{
        "tag":"(0032,0033)",
        "name":"Study Verified Time",
        "keyword":"StudyVerifiedTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "00320034":{
        "tag":"(0032,0034)",
        "name":"Study Read Date",
        "keyword":"StudyReadDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "00320035":{
        "tag":"(0032,0035)",
        "name":"Study Read Time",
        "keyword":"StudyReadTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "00321000":{
        "tag":"(0032,1000)",
        "name":"Scheduled Study Start Date",
        "keyword":"ScheduledStudyStartDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "00321001":{
        "tag":"(0032,1001)",
        "name":"Scheduled Study Start Time",
        "keyword":"ScheduledStudyStartTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "00321010":{
        "tag":"(0032,1010)",
        "name":"Scheduled Study Stop Date",
        "keyword":"ScheduledStudyStopDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "00321011":{
        "tag":"(0032,1011)",
        "name":"Scheduled Study Stop Time",
        "keyword":"ScheduledStudyStopTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "00321020":{
        "tag":"(0032,1020)",
        "name":"Scheduled Study Location",
        "keyword":"ScheduledStudyLocation",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00321021":{
        "tag":"(0032,1021)",
        "name":"Scheduled Study Location AE Title",
        "keyword":"ScheduledStudyLocationAETitle",
        "vr":"AE",
        "vm":"1-n",
        "retired":true
    },
    "00321030":{
        "tag":"(0032,1030)",
        "name":"Reason for Study",
        "keyword":"ReasonForStudy",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00321031":{
        "tag":"(0032,1031)",
        "name":"Requesting Physician Identification Sequence",
        "keyword":"RequestingPhysicianIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00321032":{
        "tag":"(0032,1032)",
        "name":"Requesting Physician",
        "keyword":"RequestingPhysician",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00321033":{
        "tag":"(0032,1033)",
        "name":"Requesting Service",
        "keyword":"RequestingService",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00321034":{
        "tag":"(0032,1034)",
        "name":"Requesting Service Code Sequence",
        "keyword":"RequestingServiceCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00321040":{
        "tag":"(0032,1040)",
        "name":"Study Arrival Date",
        "keyword":"StudyArrivalDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "00321041":{
        "tag":"(0032,1041)",
        "name":"Study Arrival Time",
        "keyword":"StudyArrivalTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "00321050":{
        "tag":"(0032,1050)",
        "name":"Study Completion Date",
        "keyword":"StudyCompletionDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "00321051":{
        "tag":"(0032,1051)",
        "name":"Study Completion Time",
        "keyword":"StudyCompletionTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "00321055":{
        "tag":"(0032,1055)",
        "name":"Study Component Status ID",
        "keyword":"StudyComponentStatusID",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00321060":{
        "tag":"(0032,1060)",
        "name":"Requested Procedure Description",
        "keyword":"RequestedProcedureDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00321064":{
        "tag":"(0032,1064)",
        "name":"Requested Procedure Code Sequence",
        "keyword":"RequestedProcedureCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00321070":{
        "tag":"(0032,1070)",
        "name":"Requested Contrast Agent",
        "keyword":"RequestedContrastAgent",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00324000":{
        "tag":"(0032,4000)",
        "name":"Study Comments",
        "keyword":"StudyComments",
        "vr":"LT",
        "vm":"1",
        "retired":true
    },
    "00380004":{
        "tag":"(0038,0004)",
        "name":"Referenced Patient Alias Sequence",
        "keyword":"ReferencedPatientAliasSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00380008":{
        "tag":"(0038,0008)",
        "name":"Visit Status ID",
        "keyword":"VisitStatusID",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00380010":{
        "tag":"(0038,0010)",
        "name":"Admission ID",
        "keyword":"AdmissionID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00380011":{
        "tag":"(0038,0011)",
        "name":"Issuer of Admission ID",
        "keyword":"IssuerOfAdmissionID",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00380014":{
        "tag":"(0038,0014)",
        "name":"Issuer of Admission ID Sequence",
        "keyword":"IssuerOfAdmissionIDSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00380016":{
        "tag":"(0038,0016)",
        "name":"Route of Admissions",
        "keyword":"RouteOfAdmissions",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0038001A":{
        "tag":"(0038,001A)",
        "name":"Scheduled Admission Date",
        "keyword":"ScheduledAdmissionDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "0038001B":{
        "tag":"(0038,001B)",
        "name":"Scheduled Admission Time",
        "keyword":"ScheduledAdmissionTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "0038001C":{
        "tag":"(0038,001C)",
        "name":"Scheduled Discharge Date",
        "keyword":"ScheduledDischargeDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "0038001D":{
        "tag":"(0038,001D)",
        "name":"Scheduled Discharge Time",
        "keyword":"ScheduledDischargeTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "0038001E":{
        "tag":"(0038,001E)",
        "name":"Scheduled Patient Institution Residence",
        "keyword":"ScheduledPatientInstitutionResidence",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00380020":{
        "tag":"(0038,0020)",
        "name":"Admitting Date",
        "keyword":"AdmittingDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00380021":{
        "tag":"(0038,0021)",
        "name":"Admitting Time",
        "keyword":"AdmittingTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00380030":{
        "tag":"(0038,0030)",
        "name":"Discharge Date",
        "keyword":"DischargeDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "00380032":{
        "tag":"(0038,0032)",
        "name":"Discharge Time",
        "keyword":"DischargeTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "00380040":{
        "tag":"(0038,0040)",
        "name":"Discharge Diagnosis Description",
        "keyword":"DischargeDiagnosisDescription",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00380044":{
        "tag":"(0038,0044)",
        "name":"Discharge Diagnosis Code Sequence",
        "keyword":"DischargeDiagnosisCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00380050":{
        "tag":"(0038,0050)",
        "name":"Special Needs",
        "keyword":"SpecialNeeds",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00380060":{
        "tag":"(0038,0060)",
        "name":"Service Episode ID",
        "keyword":"ServiceEpisodeID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00380061":{
        "tag":"(0038,0061)",
        "name":"Issuer of Service Episode ID",
        "keyword":"IssuerOfServiceEpisodeID",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00380062":{
        "tag":"(0038,0062)",
        "name":"Service Episode Description",
        "keyword":"ServiceEpisodeDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00380064":{
        "tag":"(0038,0064)",
        "name":"Issuer of Service Episode ID Sequence",
        "keyword":"IssuerOfServiceEpisodeIDSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00380100":{
        "tag":"(0038,0100)",
        "name":"Pertinent Documents Sequence",
        "keyword":"PertinentDocumentsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00380101":{
        "tag":"(0038,0101)",
        "name":"Pertinent Resources Sequence",
        "keyword":"PertinentResourcesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00380102":{
        "tag":"(0038,0102)",
        "name":"Resource Description",
        "keyword":"ResourceDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00380300":{
        "tag":"(0038,0300)",
        "name":"Current Patient Location",
        "keyword":"CurrentPatientLocation",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00380400":{
        "tag":"(0038,0400)",
        "name":"Patient's Institution Residence",
        "keyword":"PatientInstitutionResidence",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00380500":{
        "tag":"(0038,0500)",
        "name":"Patient State",
        "keyword":"PatientState",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00380502":{
        "tag":"(0038,0502)",
        "name":"Patient Clinical Trial Participation Sequence",
        "keyword":"PatientClinicalTrialParticipationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00384000":{
        "tag":"(0038,4000)",
        "name":"Visit Comments",
        "keyword":"VisitComments",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "003A0004":{
        "tag":"(003A,0004)",
        "name":"Waveform Originality",
        "keyword":"WaveformOriginality",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "003A0005":{
        "tag":"(003A,0005)",
        "name":"Number of Waveform Channels",
        "keyword":"NumberOfWaveformChannels",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "003A0010":{
        "tag":"(003A,0010)",
        "name":"Number of Waveform Samples",
        "keyword":"NumberOfWaveformSamples",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "003A001A":{
        "tag":"(003A,001A)",
        "name":"Sampling Frequency",
        "keyword":"SamplingFrequency",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "003A0020":{
        "tag":"(003A,0020)",
        "name":"Multiplex Group Label",
        "keyword":"MultiplexGroupLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "003A0200":{
        "tag":"(003A,0200)",
        "name":"Channel Definition Sequence",
        "keyword":"ChannelDefinitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "003A0202":{
        "tag":"(003A,0202)",
        "name":"Waveform Channel Number",
        "keyword":"WaveformChannelNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "003A0203":{
        "tag":"(003A,0203)",
        "name":"Channel Label",
        "keyword":"ChannelLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "003A0205":{
        "tag":"(003A,0205)",
        "name":"Channel Status",
        "keyword":"ChannelStatus",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "003A0208":{
        "tag":"(003A,0208)",
        "name":"Channel Source Sequence",
        "keyword":"ChannelSourceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "003A0209":{
        "tag":"(003A,0209)",
        "name":"Channel Source Modifiers Sequence",
        "keyword":"ChannelSourceModifiersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "003A020A":{
        "tag":"(003A,020A)",
        "name":"Source Waveform Sequence",
        "keyword":"SourceWaveformSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "003A020C":{
        "tag":"(003A,020C)",
        "name":"Channel Derivation Description",
        "keyword":"ChannelDerivationDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "003A0210":{
        "tag":"(003A,0210)",
        "name":"Channel Sensitivity",
        "keyword":"ChannelSensitivity",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "003A0211":{
        "tag":"(003A,0211)",
        "name":"Channel Sensitivity Units Sequence",
        "keyword":"ChannelSensitivityUnitsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "003A0212":{
        "tag":"(003A,0212)",
        "name":"Channel Sensitivity Correction Factor",
        "keyword":"ChannelSensitivityCorrectionFactor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "003A0213":{
        "tag":"(003A,0213)",
        "name":"Channel Baseline",
        "keyword":"ChannelBaseline",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "003A0214":{
        "tag":"(003A,0214)",
        "name":"Channel Time Skew",
        "keyword":"ChannelTimeSkew",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "003A0215":{
        "tag":"(003A,0215)",
        "name":"Channel Sample Skew",
        "keyword":"ChannelSampleSkew",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "003A0218":{
        "tag":"(003A,0218)",
        "name":"Channel Offset",
        "keyword":"ChannelOffset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "003A021A":{
        "tag":"(003A,021A)",
        "name":"Waveform Bits Stored",
        "keyword":"WaveformBitsStored",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "003A0220":{
        "tag":"(003A,0220)",
        "name":"Filter Low Frequency",
        "keyword":"FilterLowFrequency",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "003A0221":{
        "tag":"(003A,0221)",
        "name":"Filter High Frequency",
        "keyword":"FilterHighFrequency",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "003A0222":{
        "tag":"(003A,0222)",
        "name":"Notch Filter Frequency",
        "keyword":"NotchFilterFrequency",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "003A0223":{
        "tag":"(003A,0223)",
        "name":"Notch Filter Bandwidth",
        "keyword":"NotchFilterBandwidth",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "003A0230":{
        "tag":"(003A,0230)",
        "name":"Waveform Data Display Scale",
        "keyword":"WaveformDataDisplayScale",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "003A0231":{
        "tag":"(003A,0231)",
        "name":"Waveform Display Background CIELab Value",
        "keyword":"WaveformDisplayBackgroundCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "003A0240":{
        "tag":"(003A,0240)",
        "name":"Waveform Presentation Group Sequence",
        "keyword":"WaveformPresentationGroupSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "003A0241":{
        "tag":"(003A,0241)",
        "name":"Presentation Group Number",
        "keyword":"PresentationGroupNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "003A0242":{
        "tag":"(003A,0242)",
        "name":"Channel Display Sequence",
        "keyword":"ChannelDisplaySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "003A0244":{
        "tag":"(003A,0244)",
        "name":"Channel Recommended Display CIELab Value",
        "keyword":"ChannelRecommendedDisplayCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "003A0245":{
        "tag":"(003A,0245)",
        "name":"Channel Position",
        "keyword":"ChannelPosition",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "003A0246":{
        "tag":"(003A,0246)",
        "name":"Display Shading Flag",
        "keyword":"DisplayShadingFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "003A0247":{
        "tag":"(003A,0247)",
        "name":"Fractional Channel Display Scale",
        "keyword":"FractionalChannelDisplayScale",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "003A0248":{
        "tag":"(003A,0248)",
        "name":"Absolute Channel Display Scale",
        "keyword":"AbsoluteChannelDisplayScale",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "003A0300":{
        "tag":"(003A,0300)",
        "name":"Multiplexed Audio Channels Description Code Sequence",
        "keyword":"MultiplexedAudioChannelsDescriptionCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "003A0301":{
        "tag":"(003A,0301)",
        "name":"Channel Identification Code",
        "keyword":"ChannelIdentificationCode",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "003A0302":{
        "tag":"(003A,0302)",
        "name":"Channel Mode",
        "keyword":"ChannelMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00400001":{
        "tag":"(0040,0001)",
        "name":"Scheduled Station AE Title",
        "keyword":"ScheduledStationAETitle",
        "vr":"AE",
        "vm":"1-n",
        "retired":false
    },
    "00400002":{
        "tag":"(0040,0002)",
        "name":"Scheduled Procedure Step Start Date",
        "keyword":"ScheduledProcedureStepStartDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00400003":{
        "tag":"(0040,0003)",
        "name":"Scheduled Procedure Step Start Time",
        "keyword":"ScheduledProcedureStepStartTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00400004":{
        "tag":"(0040,0004)",
        "name":"Scheduled Procedure Step End Date",
        "keyword":"ScheduledProcedureStepEndDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00400005":{
        "tag":"(0040,0005)",
        "name":"Scheduled Procedure Step End Time",
        "keyword":"ScheduledProcedureStepEndTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00400006":{
        "tag":"(0040,0006)",
        "name":"Scheduled Performing Physician's Name",
        "keyword":"ScheduledPerformingPhysicianName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00400007":{
        "tag":"(0040,0007)",
        "name":"Scheduled Procedure Step Description",
        "keyword":"ScheduledProcedureStepDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00400008":{
        "tag":"(0040,0008)",
        "name":"Scheduled Protocol Code Sequence",
        "keyword":"ScheduledProtocolCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400009":{
        "tag":"(0040,0009)",
        "name":"Scheduled Procedure Step ID",
        "keyword":"ScheduledProcedureStepID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "0040000A":{
        "tag":"(0040,000A)",
        "name":"Stage Code Sequence",
        "keyword":"StageCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040000B":{
        "tag":"(0040,000B)",
        "name":"Scheduled Performing Physician Identification Sequence",
        "keyword":"ScheduledPerformingPhysicianIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400010":{
        "tag":"(0040,0010)",
        "name":"Scheduled Station Name",
        "keyword":"ScheduledStationName",
        "vr":"SH",
        "vm":"1-n",
        "retired":false
    },
    "00400011":{
        "tag":"(0040,0011)",
        "name":"Scheduled Procedure Step Location",
        "keyword":"ScheduledProcedureStepLocation",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00400012":{
        "tag":"(0040,0012)",
        "name":"Pre-Medication",
        "keyword":"PreMedication",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00400020":{
        "tag":"(0040,0020)",
        "name":"Scheduled Procedure Step Status",
        "keyword":"ScheduledProcedureStepStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00400026":{
        "tag":"(0040,0026)",
        "name":"Order Placer Identifier Sequence",
        "keyword":"OrderPlacerIdentifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400027":{
        "tag":"(0040,0027)",
        "name":"Order Filler Identifier Sequence",
        "keyword":"OrderFillerIdentifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400031":{
        "tag":"(0040,0031)",
        "name":"Local Namespace Entity ID",
        "keyword":"LocalNamespaceEntityID",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00400032":{
        "tag":"(0040,0032)",
        "name":"Universal Entity ID",
        "keyword":"UniversalEntityID",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00400033":{
        "tag":"(0040,0033)",
        "name":"Universal Entity ID Type",
        "keyword":"UniversalEntityIDType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00400035":{
        "tag":"(0040,0035)",
        "name":"Identifier Type Code",
        "keyword":"IdentifierTypeCode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00400036":{
        "tag":"(0040,0036)",
        "name":"Assigning Facility Sequence",
        "keyword":"AssigningFacilitySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400039":{
        "tag":"(0040,0039)",
        "name":"Assigning Jurisdiction Code Sequence",
        "keyword":"AssigningJurisdictionCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040003A":{
        "tag":"(0040,003A)",
        "name":"Assigning Agency or Department Code Sequence",
        "keyword":"AssigningAgencyOrDepartmentCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400100":{
        "tag":"(0040,0100)",
        "name":"Scheduled Procedure Step Sequence",
        "keyword":"ScheduledProcedureStepSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400220":{
        "tag":"(0040,0220)",
        "name":"Referenced Non-Image Composite SOP Instance Sequence",
        "keyword":"ReferencedNonImageCompositeSOPInstanceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400241":{
        "tag":"(0040,0241)",
        "name":"Performed Station AE Title",
        "keyword":"PerformedStationAETitle",
        "vr":"AE",
        "vm":"1",
        "retired":false
    },
    "00400242":{
        "tag":"(0040,0242)",
        "name":"Performed Station Name",
        "keyword":"PerformedStationName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00400243":{
        "tag":"(0040,0243)",
        "name":"Performed Location",
        "keyword":"PerformedLocation",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00400244":{
        "tag":"(0040,0244)",
        "name":"Performed Procedure Step Start Date",
        "keyword":"PerformedProcedureStepStartDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00400245":{
        "tag":"(0040,0245)",
        "name":"Performed Procedure Step Start Time",
        "keyword":"PerformedProcedureStepStartTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00400250":{
        "tag":"(0040,0250)",
        "name":"Performed Procedure Step End Date",
        "keyword":"PerformedProcedureStepEndDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00400251":{
        "tag":"(0040,0251)",
        "name":"Performed Procedure Step End Time",
        "keyword":"PerformedProcedureStepEndTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00400252":{
        "tag":"(0040,0252)",
        "name":"Performed Procedure Step Status",
        "keyword":"PerformedProcedureStepStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00400253":{
        "tag":"(0040,0253)",
        "name":"Performed Procedure Step ID",
        "keyword":"PerformedProcedureStepID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00400254":{
        "tag":"(0040,0254)",
        "name":"Performed Procedure Step Description",
        "keyword":"PerformedProcedureStepDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00400255":{
        "tag":"(0040,0255)",
        "name":"Performed Procedure Type Description",
        "keyword":"PerformedProcedureTypeDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00400260":{
        "tag":"(0040,0260)",
        "name":"Performed Protocol Code Sequence",
        "keyword":"PerformedProtocolCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400261":{
        "tag":"(0040,0261)",
        "name":"Performed Protocol Type",
        "keyword":"PerformedProtocolType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00400270":{
        "tag":"(0040,0270)",
        "name":"Scheduled Step Attributes Sequence",
        "keyword":"ScheduledStepAttributesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400275":{
        "tag":"(0040,0275)",
        "name":"Request Attributes Sequence",
        "keyword":"RequestAttributesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400280":{
        "tag":"(0040,0280)",
        "name":"Comments on the Performed Procedure Step",
        "keyword":"CommentsOnThePerformedProcedureStep",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00400281":{
        "tag":"(0040,0281)",
        "name":"Performed Procedure Step Discontinuation Reason Code Sequence",
        "keyword":"PerformedProcedureStepDiscontinuationReasonCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400293":{
        "tag":"(0040,0293)",
        "name":"Quantity Sequence",
        "keyword":"QuantitySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400294":{
        "tag":"(0040,0294)",
        "name":"Quantity",
        "keyword":"Quantity",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00400295":{
        "tag":"(0040,0295)",
        "name":"Measuring Units Sequence",
        "keyword":"MeasuringUnitsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400296":{
        "tag":"(0040,0296)",
        "name":"Billing Item Sequence",
        "keyword":"BillingItemSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400300":{
        "tag":"(0040,0300)",
        "name":"Total Time of Fluoroscopy",
        "keyword":"TotalTimeOfFluoroscopy",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00400301":{
        "tag":"(0040,0301)",
        "name":"Total Number of Exposures",
        "keyword":"TotalNumberOfExposures",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "00400302":{
        "tag":"(0040,0302)",
        "name":"Entrance Dose",
        "keyword":"EntranceDose",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00400303":{
        "tag":"(0040,0303)",
        "name":"Exposed Area",
        "keyword":"ExposedArea",
        "vr":"US",
        "vm":"1-2",
        "retired":false
    },
    "00400306":{
        "tag":"(0040,0306)",
        "name":"Distance Source to Entrance",
        "keyword":"DistanceSourceToEntrance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00400307":{
        "tag":"(0040,0307)",
        "name":"Distance Source to Support",
        "keyword":"DistanceSourceToSupport",
        "vr":"DS",
        "vm":"1",
        "retired":true
    },
    "0040030E":{
        "tag":"(0040,030E)",
        "name":"Exposure Dose Sequence",
        "keyword":"ExposureDoseSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00400310":{
        "tag":"(0040,0310)",
        "name":"Comments on Radiation Dose",
        "keyword":"CommentsOnRadiationDose",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00400312":{
        "tag":"(0040,0312)",
        "name":"X-Ray Output",
        "keyword":"XRayOutput",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00400314":{
        "tag":"(0040,0314)",
        "name":"Half Value Layer",
        "keyword":"HalfValueLayer",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00400316":{
        "tag":"(0040,0316)",
        "name":"Organ Dose",
        "keyword":"OrganDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00400318":{
        "tag":"(0040,0318)",
        "name":"Organ Exposed",
        "keyword":"OrganExposed",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00400320":{
        "tag":"(0040,0320)",
        "name":"Billing Procedure Step Sequence",
        "keyword":"BillingProcedureStepSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400321":{
        "tag":"(0040,0321)",
        "name":"Film Consumption Sequence",
        "keyword":"FilmConsumptionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400324":{
        "tag":"(0040,0324)",
        "name":"Billing Supplies and Devices Sequence",
        "keyword":"BillingSuppliesAndDevicesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400330":{
        "tag":"(0040,0330)",
        "name":"Referenced Procedure Step Sequence",
        "keyword":"ReferencedProcedureStepSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00400340":{
        "tag":"(0040,0340)",
        "name":"Performed Series Sequence",
        "keyword":"PerformedSeriesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400400":{
        "tag":"(0040,0400)",
        "name":"Comments on the Scheduled Procedure Step",
        "keyword":"CommentsOnTheScheduledProcedureStep",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00400440":{
        "tag":"(0040,0440)",
        "name":"Protocol Context Sequence",
        "keyword":"ProtocolContextSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400441":{
        "tag":"(0040,0441)",
        "name":"Content Item Modifier Sequence",
        "keyword":"ContentItemModifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400500":{
        "tag":"(0040,0500)",
        "name":"Scheduled Specimen Sequence",
        "keyword":"ScheduledSpecimenSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040050A":{
        "tag":"(0040,050A)",
        "name":"Specimen Accession Number",
        "keyword":"SpecimenAccessionNumber",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00400512":{
        "tag":"(0040,0512)",
        "name":"Container Identifier",
        "keyword":"ContainerIdentifier",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00400513":{
        "tag":"(0040,0513)",
        "name":"Issuer of the Container Identifier Sequence",
        "keyword":"IssuerOfTheContainerIdentifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400515":{
        "tag":"(0040,0515)",
        "name":"Alternate Container Identifier Sequence",
        "keyword":"AlternateContainerIdentifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400518":{
        "tag":"(0040,0518)",
        "name":"Container Type Code Sequence",
        "keyword":"ContainerTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040051A":{
        "tag":"(0040,051A)",
        "name":"Container Description",
        "keyword":"ContainerDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00400520":{
        "tag":"(0040,0520)",
        "name":"Container Component Sequence",
        "keyword":"ContainerComponentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400550":{
        "tag":"(0040,0550)",
        "name":"Specimen Sequence",
        "keyword":"SpecimenSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00400551":{
        "tag":"(0040,0551)",
        "name":"Specimen Identifier",
        "keyword":"SpecimenIdentifier",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00400552":{
        "tag":"(0040,0552)",
        "name":"Specimen Description Sequence (Trial)",
        "keyword":"SpecimenDescriptionSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00400553":{
        "tag":"(0040,0553)",
        "name":"Specimen Description (Trial)",
        "keyword":"SpecimenDescriptionTrial",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "00400554":{
        "tag":"(0040,0554)",
        "name":"Specimen UID",
        "keyword":"SpecimenUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00400555":{
        "tag":"(0040,0555)",
        "name":"Acquisition Context Sequence",
        "keyword":"AcquisitionContextSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400556":{
        "tag":"(0040,0556)",
        "name":"Acquisition Context Description",
        "keyword":"AcquisitionContextDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "0040059A":{
        "tag":"(0040,059A)",
        "name":"Specimen Type Code Sequence",
        "keyword":"SpecimenTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400560":{
        "tag":"(0040,0560)",
        "name":"Specimen Description Sequence",
        "keyword":"SpecimenDescriptionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400562":{
        "tag":"(0040,0562)",
        "name":"Issuer of the Specimen Identifier Sequence",
        "keyword":"IssuerOfTheSpecimenIdentifierSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400600":{
        "tag":"(0040,0600)",
        "name":"Specimen Short Description",
        "keyword":"SpecimenShortDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00400602":{
        "tag":"(0040,0602)",
        "name":"Specimen Detailed Description",
        "keyword":"SpecimenDetailedDescription",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00400610":{
        "tag":"(0040,0610)",
        "name":"Specimen Preparation Sequence",
        "keyword":"SpecimenPreparationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400612":{
        "tag":"(0040,0612)",
        "name":"Specimen Preparation Step Content Item Sequence",
        "keyword":"SpecimenPreparationStepContentItemSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00400620":{
        "tag":"(0040,0620)",
        "name":"Specimen Localization Content Item Sequence",
        "keyword":"SpecimenLocalizationContentItemSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "004006FA":{
        "tag":"(0040,06FA)",
        "name":"Slide Identifier",
        "keyword":"SlideIdentifier",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "0040071A":{
        "tag":"(0040,071A)",
        "name":"Image Center Point Coordinates Sequence",
        "keyword":"ImageCenterPointCoordinatesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040072A":{
        "tag":"(0040,072A)",
        "name":"X Offset in Slide Coordinate System",
        "keyword":"XOffsetInSlideCoordinateSystem",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0040073A":{
        "tag":"(0040,073A)",
        "name":"Y Offset in Slide Coordinate System",
        "keyword":"YOffsetInSlideCoordinateSystem",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0040074A":{
        "tag":"(0040,074A)",
        "name":"Z Offset in Slide Coordinate System",
        "keyword":"ZOffsetInSlideCoordinateSystem",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "004008D8":{
        "tag":"(0040,08D8)",
        "name":"Pixel Spacing Sequence",
        "keyword":"PixelSpacingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "004008DA":{
        "tag":"(0040,08DA)",
        "name":"Coordinate System Axis Code Sequence",
        "keyword":"CoordinateSystemAxisCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "004008EA":{
        "tag":"(0040,08EA)",
        "name":"Measurement Units Code Sequence",
        "keyword":"MeasurementUnitsCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "004009F8":{
        "tag":"(0040,09F8)",
        "name":"Vital Stain Code Sequence (Trial)",
        "keyword":"VitalStainCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00401001":{
        "tag":"(0040,1001)",
        "name":"Requested Procedure ID",
        "keyword":"RequestedProcedureID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00401002":{
        "tag":"(0040,1002)",
        "name":"Reason for the Requested Procedure",
        "keyword":"ReasonForTheRequestedProcedure",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00401003":{
        "tag":"(0040,1003)",
        "name":"Requested Procedure Priority",
        "keyword":"RequestedProcedurePriority",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00401004":{
        "tag":"(0040,1004)",
        "name":"Patient Transport Arrangements",
        "keyword":"PatientTransportArrangements",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00401005":{
        "tag":"(0040,1005)",
        "name":"Requested Procedure Location",
        "keyword":"RequestedProcedureLocation",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00401006":{
        "tag":"(0040,1006)",
        "name":"Placer Order Number / Procedure",
        "keyword":"PlacerOrderNumberProcedure",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "00401007":{
        "tag":"(0040,1007)",
        "name":"Filler Order Number / Procedure",
        "keyword":"FillerOrderNumberProcedure",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "00401008":{
        "tag":"(0040,1008)",
        "name":"Confidentiality Code",
        "keyword":"ConfidentialityCode",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00401009":{
        "tag":"(0040,1009)",
        "name":"Reporting Priority",
        "keyword":"ReportingPriority",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "0040100A":{
        "tag":"(0040,100A)",
        "name":"Reason for Requested Procedure Code Sequence",
        "keyword":"ReasonForRequestedProcedureCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00401010":{
        "tag":"(0040,1010)",
        "name":"Names of Intended Recipients of Results",
        "keyword":"NamesOfIntendedRecipientsOfResults",
        "vr":"PN",
        "vm":"1-n",
        "retired":false
    },
    "00401011":{
        "tag":"(0040,1011)",
        "name":"Intended Recipients of Results Identification Sequence",
        "keyword":"IntendedRecipientsOfResultsIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00401012":{
        "tag":"(0040,1012)",
        "name":"Reason For Performed Procedure Code Sequence",
        "keyword":"ReasonForPerformedProcedureCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00401060":{
        "tag":"(0040,1060)",
        "name":"Requested Procedure Description (Trial)",
        "keyword":"RequestedProcedureDescriptionTrial",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00401101":{
        "tag":"(0040,1101)",
        "name":"Person Identification Code Sequence",
        "keyword":"PersonIdentificationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00401102":{
        "tag":"(0040,1102)",
        "name":"Person's Address",
        "keyword":"PersonAddress",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00401103":{
        "tag":"(0040,1103)",
        "name":"Person's Telephone Numbers",
        "keyword":"PersonTelephoneNumbers",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00401104":{
        "tag":"(0040,1104)",
        "name":"Person's Telecom Information",
        "keyword":"PersonTelecomInformation",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00401400":{
        "tag":"(0040,1400)",
        "name":"Requested Procedure Comments",
        "keyword":"RequestedProcedureComments",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00402001":{
        "tag":"(0040,2001)",
        "name":"Reason for the Imaging Service Request",
        "keyword":"ReasonForTheImagingServiceRequest",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00402004":{
        "tag":"(0040,2004)",
        "name":"Issue Date of Imaging Service Request",
        "keyword":"IssueDateOfImagingServiceRequest",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00402005":{
        "tag":"(0040,2005)",
        "name":"Issue Time of Imaging Service Request",
        "keyword":"IssueTimeOfImagingServiceRequest",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00402006":{
        "tag":"(0040,2006)",
        "name":"Placer Order Number / Imaging Service Request (Retired)",
        "keyword":"PlacerOrderNumberImagingServiceRequestRetired",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "00402007":{
        "tag":"(0040,2007)",
        "name":"Filler Order Number / Imaging Service Request (Retired)",
        "keyword":"FillerOrderNumberImagingServiceRequestRetired",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "00402008":{
        "tag":"(0040,2008)",
        "name":"Order Entered By",
        "keyword":"OrderEnteredBy",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00402009":{
        "tag":"(0040,2009)",
        "name":"Order Enterer's Location",
        "keyword":"OrderEntererLocation",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00402010":{
        "tag":"(0040,2010)",
        "name":"Order Callback Phone Number",
        "keyword":"OrderCallbackPhoneNumber",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00402011":{
        "tag":"(0040,2011)",
        "name":"Order Callback Telecom Information",
        "keyword":"OrderCallbackTelecomInformation",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00402016":{
        "tag":"(0040,2016)",
        "name":"Placer Order Number / Imaging Service Request",
        "keyword":"PlacerOrderNumberImagingServiceRequest",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00402017":{
        "tag":"(0040,2017)",
        "name":"Filler Order Number / Imaging Service Request",
        "keyword":"FillerOrderNumberImagingServiceRequest",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00402400":{
        "tag":"(0040,2400)",
        "name":"Imaging Service Request Comments",
        "keyword":"ImagingServiceRequestComments",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00403001":{
        "tag":"(0040,3001)",
        "name":"Confidentiality Constraint on Patient Data Description",
        "keyword":"ConfidentialityConstraintOnPatientDataDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00404001":{
        "tag":"(0040,4001)",
        "name":"General Purpose Scheduled Procedure Step Status",
        "keyword":"GeneralPurposeScheduledProcedureStepStatus",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00404002":{
        "tag":"(0040,4002)",
        "name":"General Purpose Performed Procedure Step Status",
        "keyword":"GeneralPurposePerformedProcedureStepStatus",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00404003":{
        "tag":"(0040,4003)",
        "name":"General Purpose Scheduled Procedure Step Priority",
        "keyword":"GeneralPurposeScheduledProcedureStepPriority",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00404004":{
        "tag":"(0040,4004)",
        "name":"Scheduled Processing Applications Code Sequence",
        "keyword":"ScheduledProcessingApplicationsCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00404005":{
        "tag":"(0040,4005)",
        "name":"Scheduled Procedure Step Start DateTime",
        "keyword":"ScheduledProcedureStepStartDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00404006":{
        "tag":"(0040,4006)",
        "name":"Multiple Copies Flag",
        "keyword":"MultipleCopiesFlag",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00404007":{
        "tag":"(0040,4007)",
        "name":"Performed Processing Applications Code Sequence",
        "keyword":"PerformedProcessingApplicationsCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404009":{
        "tag":"(0040,4009)",
        "name":"Human Performer Code Sequence",
        "keyword":"HumanPerformerCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404010":{
        "tag":"(0040,4010)",
        "name":"Scheduled Procedure Step Modification DateTime",
        "keyword":"ScheduledProcedureStepModificationDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00404011":{
        "tag":"(0040,4011)",
        "name":"Expected Completion DateTime",
        "keyword":"ExpectedCompletionDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00404015":{
        "tag":"(0040,4015)",
        "name":"Resulting General Purpose Performed Procedure Steps Sequence",
        "keyword":"ResultingGeneralPurposePerformedProcedureStepsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00404016":{
        "tag":"(0040,4016)",
        "name":"Referenced General Purpose Scheduled Procedure Step Sequence",
        "keyword":"ReferencedGeneralPurposeScheduledProcedureStepSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00404018":{
        "tag":"(0040,4018)",
        "name":"Scheduled Workitem Code Sequence",
        "keyword":"ScheduledWorkitemCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404019":{
        "tag":"(0040,4019)",
        "name":"Performed Workitem Code Sequence",
        "keyword":"PerformedWorkitemCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404020":{
        "tag":"(0040,4020)",
        "name":"Input Availability Flag",
        "keyword":"InputAvailabilityFlag",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00404021":{
        "tag":"(0040,4021)",
        "name":"Input Information Sequence",
        "keyword":"InputInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404022":{
        "tag":"(0040,4022)",
        "name":"Relevant Information Sequence",
        "keyword":"RelevantInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00404023":{
        "tag":"(0040,4023)",
        "name":"Referenced General Purpose Scheduled Procedure Step Transaction UID",
        "keyword":"ReferencedGeneralPurposeScheduledProcedureStepTransactionUID",
        "vr":"UI",
        "vm":"1",
        "retired":true
    },
    "00404025":{
        "tag":"(0040,4025)",
        "name":"Scheduled Station Name Code Sequence",
        "keyword":"ScheduledStationNameCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404026":{
        "tag":"(0040,4026)",
        "name":"Scheduled Station Class Code Sequence",
        "keyword":"ScheduledStationClassCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404027":{
        "tag":"(0040,4027)",
        "name":"Scheduled Station Geographic Location Code Sequence",
        "keyword":"ScheduledStationGeographicLocationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404028":{
        "tag":"(0040,4028)",
        "name":"Performed Station Name Code Sequence",
        "keyword":"PerformedStationNameCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404029":{
        "tag":"(0040,4029)",
        "name":"Performed Station Class Code Sequence",
        "keyword":"PerformedStationClassCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404030":{
        "tag":"(0040,4030)",
        "name":"Performed Station Geographic Location Code Sequence",
        "keyword":"PerformedStationGeographicLocationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404031":{
        "tag":"(0040,4031)",
        "name":"Requested Subsequent Workitem Code Sequence",
        "keyword":"RequestedSubsequentWorkitemCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00404032":{
        "tag":"(0040,4032)",
        "name":"Non-DICOM Output Code Sequence",
        "keyword":"NonDICOMOutputCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00404033":{
        "tag":"(0040,4033)",
        "name":"Output Information Sequence",
        "keyword":"OutputInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404034":{
        "tag":"(0040,4034)",
        "name":"Scheduled Human Performers Sequence",
        "keyword":"ScheduledHumanPerformersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404035":{
        "tag":"(0040,4035)",
        "name":"Actual Human Performers Sequence",
        "keyword":"ActualHumanPerformersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404036":{
        "tag":"(0040,4036)",
        "name":"Human Performer's Organization",
        "keyword":"HumanPerformerOrganization",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00404037":{
        "tag":"(0040,4037)",
        "name":"Human Performer's Name",
        "keyword":"HumanPerformerName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00404040":{
        "tag":"(0040,4040)",
        "name":"Raw Data Handling",
        "keyword":"RawDataHandling",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00404041":{
        "tag":"(0040,4041)",
        "name":"Input Readiness State",
        "keyword":"InputReadinessState",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00404050":{
        "tag":"(0040,4050)",
        "name":"Performed Procedure Step Start DateTime",
        "keyword":"PerformedProcedureStepStartDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00404051":{
        "tag":"(0040,4051)",
        "name":"Performed Procedure Step End DateTime",
        "keyword":"PerformedProcedureStepEndDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00404052":{
        "tag":"(0040,4052)",
        "name":"Procedure Step Cancellation DateTime",
        "keyword":"ProcedureStepCancellationDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00404070":{
        "tag":"(0040,4070)",
        "name":"Output Destination Sequence",
        "keyword":"OutputDestinationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404071":{
        "tag":"(0040,4071)",
        "name":"DICOM Storage Sequence",
        "keyword":"DICOMStorageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404072":{
        "tag":"(0040,4072)",
        "name":"STOW-RS Storage Sequence",
        "keyword":"STOWRSStorageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00404073":{
        "tag":"(0040,4073)",
        "name":"Storage URL",
        "keyword":"StorageURL",
        "vr":"UR",
        "vm":"1",
        "retired":false
    },
    "00404074":{
        "tag":"(0040,4074)",
        "name":"XDS Storage Sequence",
        "keyword":"XDSStorageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00408302":{
        "tag":"(0040,8302)",
        "name":"Entrance Dose in mGy",
        "keyword":"EntranceDoseInmGy",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00408303":{
        "tag":"(0040,8303)",
        "name":"Entrance Dose Derivation",
        "keyword":"EntranceDoseDerivation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00409092":{
        "tag":"(0040,9092)",
        "name":"Parametric Map Frame Type Sequence",
        "keyword":"ParametricMapFrameTypeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00409094":{
        "tag":"(0040,9094)",
        "name":"Referenced Image Real World Value Mapping Sequence",
        "keyword":"ReferencedImageRealWorldValueMappingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00409096":{
        "tag":"(0040,9096)",
        "name":"Real World Value Mapping Sequence",
        "keyword":"RealWorldValueMappingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00409098":{
        "tag":"(0040,9098)",
        "name":"Pixel Value Mapping Code Sequence",
        "keyword":"PixelValueMappingCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00409210":{
        "tag":"(0040,9210)",
        "name":"LUT Label",
        "keyword":"LUTLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00409211":{
        "tag":"(0040,9211)",
        "name":"Real World Value Last Value Mapped",
        "keyword":"RealWorldValueLastValueMapped",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00409212":{
        "tag":"(0040,9212)",
        "name":"Real World Value LUT Data",
        "keyword":"RealWorldValueLUTData",
        "vr":"FD",
        "vm":"1-n",
        "retired":false
    },
    "00409213":{
        "tag":"(0040,9213)",
        "name":"Double Float Real World Value Last Value Mapped",
        "keyword":"DoubleFloatRealWorldValueLastValueMapped",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00409214":{
        "tag":"(0040,9214)",
        "name":"Double Float Real World Value First Value Mapped",
        "keyword":"DoubleFloatRealWorldValueFirstValueMapped",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00409216":{
        "tag":"(0040,9216)",
        "name":"Real World Value First Value Mapped",
        "keyword":"RealWorldValueFirstValueMapped",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00409220":{
        "tag":"(0040,9220)",
        "name":"Quantity Definition Sequence",
        "keyword":"QuantityDefinitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00409224":{
        "tag":"(0040,9224)",
        "name":"Real World Value Intercept",
        "keyword":"RealWorldValueIntercept",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00409225":{
        "tag":"(0040,9225)",
        "name":"Real World Value Slope",
        "keyword":"RealWorldValueSlope",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0040A007":{
        "tag":"(0040,A007)",
        "name":"Findings Flag (Trial)",
        "keyword":"FindingsFlagTrial",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0040A010":{
        "tag":"(0040,A010)",
        "name":"Relationship Type",
        "keyword":"RelationshipType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040A020":{
        "tag":"(0040,A020)",
        "name":"Findings Sequence (Trial)",
        "keyword":"FindingsSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A021":{
        "tag":"(0040,A021)",
        "name":"Findings Group UID (Trial)",
        "keyword":"FindingsGroupUIDTrial",
        "vr":"UI",
        "vm":"1",
        "retired":true
    },
    "0040A022":{
        "tag":"(0040,A022)",
        "name":"Referenced Findings Group UID (Trial)",
        "keyword":"ReferencedFindingsGroupUIDTrial",
        "vr":"UI",
        "vm":"1",
        "retired":true
    },
    "0040A023":{
        "tag":"(0040,A023)",
        "name":"Findings Group Recording Date (Trial)",
        "keyword":"FindingsGroupRecordingDateTrial",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "0040A024":{
        "tag":"(0040,A024)",
        "name":"Findings Group Recording Time (Trial)",
        "keyword":"FindingsGroupRecordingTimeTrial",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "0040A026":{
        "tag":"(0040,A026)",
        "name":"Findings Source Category Code Sequence (Trial)",
        "keyword":"FindingsSourceCategoryCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A027":{
        "tag":"(0040,A027)",
        "name":"Verifying Organization",
        "keyword":"VerifyingOrganization",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0040A028":{
        "tag":"(0040,A028)",
        "name":"Documenting Organization Identifier Code Sequence (Trial)",
        "keyword":"DocumentingOrganizationIdentifierCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A030":{
        "tag":"(0040,A030)",
        "name":"Verification DateTime",
        "keyword":"VerificationDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "0040A032":{
        "tag":"(0040,A032)",
        "name":"Observation DateTime",
        "keyword":"ObservationDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "0040A040":{
        "tag":"(0040,A040)",
        "name":"Value Type",
        "keyword":"ValueType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040A043":{
        "tag":"(0040,A043)",
        "name":"Concept Name Code Sequence",
        "keyword":"ConceptNameCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A047":{
        "tag":"(0040,A047)",
        "name":"Measurement Precision Description (Trial)",
        "keyword":"MeasurementPrecisionDescriptionTrial",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "0040A050":{
        "tag":"(0040,A050)",
        "name":"Continuity Of Content",
        "keyword":"ContinuityOfContent",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040A057":{
        "tag":"(0040,A057)",
        "name":"Urgency or Priority Alerts (Trial)",
        "keyword":"UrgencyOrPriorityAlertsTrial",
        "vr":"CS",
        "vm":"1-n",
        "retired":true
    },
    "0040A060":{
        "tag":"(0040,A060)",
        "name":"Sequencing Indicator (Trial)",
        "keyword":"SequencingIndicatorTrial",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "0040A066":{
        "tag":"(0040,A066)",
        "name":"Document Identifier Code Sequence (Trial)",
        "keyword":"DocumentIdentifierCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A067":{
        "tag":"(0040,A067)",
        "name":"Document Author (Trial)",
        "keyword":"DocumentAuthorTrial",
        "vr":"PN",
        "vm":"1",
        "retired":true
    },
    "0040A068":{
        "tag":"(0040,A068)",
        "name":"Document Author Identifier Code Sequence (Trial)",
        "keyword":"DocumentAuthorIdentifierCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A070":{
        "tag":"(0040,A070)",
        "name":"Identifier Code Sequence (Trial)",
        "keyword":"IdentifierCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A073":{
        "tag":"(0040,A073)",
        "name":"Verifying Observer Sequence",
        "keyword":"VerifyingObserverSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A074":{
        "tag":"(0040,A074)",
        "name":"Object Binary Identifier (Trial)",
        "keyword":"ObjectBinaryIdentifierTrial",
        "vr":"OB",
        "vm":"1",
        "retired":true
    },
    "0040A075":{
        "tag":"(0040,A075)",
        "name":"Verifying Observer Name",
        "keyword":"VerifyingObserverName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "0040A076":{
        "tag":"(0040,A076)",
        "name":"Documenting Observer Identifier Code Sequence (Trial)",
        "keyword":"DocumentingObserverIdentifierCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A078":{
        "tag":"(0040,A078)",
        "name":"Author Observer Sequence",
        "keyword":"AuthorObserverSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A07A":{
        "tag":"(0040,A07A)",
        "name":"Participant Sequence",
        "keyword":"ParticipantSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A07C":{
        "tag":"(0040,A07C)",
        "name":"Custodial Organization Sequence",
        "keyword":"CustodialOrganizationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A080":{
        "tag":"(0040,A080)",
        "name":"Participation Type",
        "keyword":"ParticipationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040A082":{
        "tag":"(0040,A082)",
        "name":"Participation DateTime",
        "keyword":"ParticipationDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "0040A084":{
        "tag":"(0040,A084)",
        "name":"Observer Type",
        "keyword":"ObserverType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040A085":{
        "tag":"(0040,A085)",
        "name":"Procedure Identifier Code Sequence (Trial)",
        "keyword":"ProcedureIdentifierCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A088":{
        "tag":"(0040,A088)",
        "name":"Verifying Observer Identification Code Sequence",
        "keyword":"VerifyingObserverIdentificationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A089":{
        "tag":"(0040,A089)",
        "name":"Object Directory Binary Identifier (Trial)",
        "keyword":"ObjectDirectoryBinaryIdentifierTrial",
        "vr":"OB",
        "vm":"1",
        "retired":true
    },
    "0040A090":{
        "tag":"(0040,A090)",
        "name":"Equivalent CDA Document Sequence",
        "keyword":"EquivalentCDADocumentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A0B0":{
        "tag":"(0040,A0B0)",
        "name":"Referenced Waveform Channels",
        "keyword":"ReferencedWaveformChannels",
        "vr":"US",
        "vm":"2-2n",
        "retired":false
    },
    "0040A110":{
        "tag":"(0040,A110)",
        "name":"Date of Document or Verbal Transaction (Trial)",
        "keyword":"DateOfDocumentOrVerbalTransactionTrial",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "0040A112":{
        "tag":"(0040,A112)",
        "name":"Time of Document Creation or Verbal Transaction (Trial)",
        "keyword":"TimeOfDocumentCreationOrVerbalTransactionTrial",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "0040A120":{
        "tag":"(0040,A120)",
        "name":"DateTime",
        "keyword":"DateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "0040A121":{
        "tag":"(0040,A121)",
        "name":"Date",
        "keyword":"Date",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "0040A122":{
        "tag":"(0040,A122)",
        "name":"Time",
        "keyword":"Time",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "0040A123":{
        "tag":"(0040,A123)",
        "name":"Person Name",
        "keyword":"PersonName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "0040A124":{
        "tag":"(0040,A124)",
        "name":"UID",
        "keyword":"UID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0040A125":{
        "tag":"(0040,A125)",
        "name":"Report Status ID (Trial)",
        "keyword":"ReportStatusIDTrial",
        "vr":"CS",
        "vm":"2",
        "retired":true
    },
    "0040A130":{
        "tag":"(0040,A130)",
        "name":"Temporal Range Type",
        "keyword":"TemporalRangeType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040A132":{
        "tag":"(0040,A132)",
        "name":"Referenced Sample Positions",
        "keyword":"ReferencedSamplePositions",
        "vr":"UL",
        "vm":"1-n",
        "retired":false
    },
    "0040A136":{
        "tag":"(0040,A136)",
        "name":"Referenced Frame Numbers",
        "keyword":"ReferencedFrameNumbers",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "0040A138":{
        "tag":"(0040,A138)",
        "name":"Referenced Time Offsets",
        "keyword":"ReferencedTimeOffsets",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "0040A13A":{
        "tag":"(0040,A13A)",
        "name":"Referenced DateTime",
        "keyword":"ReferencedDateTime",
        "vr":"DT",
        "vm":"1-n",
        "retired":false
    },
    "0040A160":{
        "tag":"(0040,A160)",
        "name":"Text Value",
        "keyword":"TextValue",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "0040A161":{
        "tag":"(0040,A161)",
        "name":"Floating Point Value",
        "keyword":"FloatingPointValue",
        "vr":"FD",
        "vm":"1-n",
        "retired":false
    },
    "0040A162":{
        "tag":"(0040,A162)",
        "name":"Rational Numerator Value",
        "keyword":"RationalNumeratorValue",
        "vr":"SL",
        "vm":"1-n",
        "retired":false
    },
    "0040A163":{
        "tag":"(0040,A163)",
        "name":"Rational Denominator Value",
        "keyword":"RationalDenominatorValue",
        "vr":"UL",
        "vm":"1-n",
        "retired":false
    },
    "0040A167":{
        "tag":"(0040,A167)",
        "name":"Observation Category Code Sequence (Trial)",
        "keyword":"ObservationCategoryCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A168":{
        "tag":"(0040,A168)",
        "name":"Concept Code Sequence",
        "keyword":"ConceptCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A16A":{
        "tag":"(0040,A16A)",
        "name":"Bibliographic Citation (Trial)",
        "keyword":"BibliographicCitationTrial",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "0040A170":{
        "tag":"(0040,A170)",
        "name":"Purpose of Reference Code Sequence",
        "keyword":"PurposeOfReferenceCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A171":{
        "tag":"(0040,A171)",
        "name":"Observation UID",
        "keyword":"ObservationUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0040A172":{
        "tag":"(0040,A172)",
        "name":"Referenced Observation UID (Trial)",
        "keyword":"ReferencedObservationUIDTrial",
        "vr":"UI",
        "vm":"1",
        "retired":true
    },
    "0040A173":{
        "tag":"(0040,A173)",
        "name":"Referenced Observation Class (Trial)",
        "keyword":"ReferencedObservationClassTrial",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0040A174":{
        "tag":"(0040,A174)",
        "name":"Referenced Object Observation Class (Trial)",
        "keyword":"ReferencedObjectObservationClassTrial",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0040A180":{
        "tag":"(0040,A180)",
        "name":"Annotation Group Number",
        "keyword":"AnnotationGroupNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "0040A192":{
        "tag":"(0040,A192)",
        "name":"Observation Date (Trial)",
        "keyword":"ObservationDateTrial",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "0040A193":{
        "tag":"(0040,A193)",
        "name":"Observation Time (Trial)",
        "keyword":"ObservationTimeTrial",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "0040A194":{
        "tag":"(0040,A194)",
        "name":"Measurement Automation (Trial)",
        "keyword":"MeasurementAutomationTrial",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0040A195":{
        "tag":"(0040,A195)",
        "name":"Modifier Code Sequence",
        "keyword":"ModifierCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A224":{
        "tag":"(0040,A224)",
        "name":"Identification Description (Trial)",
        "keyword":"IdentificationDescriptionTrial",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "0040A290":{
        "tag":"(0040,A290)",
        "name":"Coordinates Set Geometric Type (Trial)",
        "keyword":"CoordinatesSetGeometricTypeTrial",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0040A296":{
        "tag":"(0040,A296)",
        "name":"Algorithm Code Sequence (Trial)",
        "keyword":"AlgorithmCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A297":{
        "tag":"(0040,A297)",
        "name":"Algorithm Description (Trial)",
        "keyword":"AlgorithmDescriptionTrial",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "0040A29A":{
        "tag":"(0040,A29A)",
        "name":"Pixel Coordinates Set (Trial)",
        "keyword":"PixelCoordinatesSetTrial",
        "vr":"SL",
        "vm":"2-2n",
        "retired":true
    },
    "0040A300":{
        "tag":"(0040,A300)",
        "name":"Measured Value Sequence",
        "keyword":"MeasuredValueSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A301":{
        "tag":"(0040,A301)",
        "name":"Numeric Value Qualifier Code Sequence",
        "keyword":"NumericValueQualifierCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A307":{
        "tag":"(0040,A307)",
        "name":"Current Observer (Trial)",
        "keyword":"CurrentObserverTrial",
        "vr":"PN",
        "vm":"1",
        "retired":true
    },
    "0040A30A":{
        "tag":"(0040,A30A)",
        "name":"Numeric Value",
        "keyword":"NumericValue",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "0040A313":{
        "tag":"(0040,A313)",
        "name":"Referenced Accession Sequence (Trial)",
        "keyword":"ReferencedAccessionSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A33A":{
        "tag":"(0040,A33A)",
        "name":"Report Status Comment (Trial)",
        "keyword":"ReportStatusCommentTrial",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "0040A340":{
        "tag":"(0040,A340)",
        "name":"Procedure Context Sequence (Trial)",
        "keyword":"ProcedureContextSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A352":{
        "tag":"(0040,A352)",
        "name":"Verbal Source (Trial)",
        "keyword":"VerbalSourceTrial",
        "vr":"PN",
        "vm":"1",
        "retired":true
    },
    "0040A353":{
        "tag":"(0040,A353)",
        "name":"Address (Trial)",
        "keyword":"AddressTrial",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "0040A354":{
        "tag":"(0040,A354)",
        "name":"Telephone Number (Trial)",
        "keyword":"TelephoneNumberTrial",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "0040A358":{
        "tag":"(0040,A358)",
        "name":"Verbal Source Identifier Code Sequence (Trial)",
        "keyword":"VerbalSourceIdentifierCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A360":{
        "tag":"(0040,A360)",
        "name":"Predecessor Documents Sequence",
        "keyword":"PredecessorDocumentsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A370":{
        "tag":"(0040,A370)",
        "name":"Referenced Request Sequence",
        "keyword":"ReferencedRequestSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A372":{
        "tag":"(0040,A372)",
        "name":"Performed Procedure Code Sequence",
        "keyword":"PerformedProcedureCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A375":{
        "tag":"(0040,A375)",
        "name":"Current Requested Procedure Evidence Sequence",
        "keyword":"CurrentRequestedProcedureEvidenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A380":{
        "tag":"(0040,A380)",
        "name":"Report Detail Sequence (Trial)",
        "keyword":"ReportDetailSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A385":{
        "tag":"(0040,A385)",
        "name":"Pertinent Other Evidence Sequence",
        "keyword":"PertinentOtherEvidenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A390":{
        "tag":"(0040,A390)",
        "name":"HL7 Structured Document Reference Sequence",
        "keyword":"HL7StructuredDocumentReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A402":{
        "tag":"(0040,A402)",
        "name":"Observation Subject UID (Trial)",
        "keyword":"ObservationSubjectUIDTrial",
        "vr":"UI",
        "vm":"1",
        "retired":true
    },
    "0040A403":{
        "tag":"(0040,A403)",
        "name":"Observation Subject Class (Trial)",
        "keyword":"ObservationSubjectClassTrial",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0040A404":{
        "tag":"(0040,A404)",
        "name":"Observation Subject Type Code Sequence (Trial)",
        "keyword":"ObservationSubjectTypeCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A491":{
        "tag":"(0040,A491)",
        "name":"Completion Flag",
        "keyword":"CompletionFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040A492":{
        "tag":"(0040,A492)",
        "name":"Completion Flag Description",
        "keyword":"CompletionFlagDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0040A493":{
        "tag":"(0040,A493)",
        "name":"Verification Flag",
        "keyword":"VerificationFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040A494":{
        "tag":"(0040,A494)",
        "name":"Archive Requested",
        "keyword":"ArchiveRequested",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040A496":{
        "tag":"(0040,A496)",
        "name":"Preliminary Flag",
        "keyword":"PreliminaryFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040A504":{
        "tag":"(0040,A504)",
        "name":"Content Template Sequence",
        "keyword":"ContentTemplateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A525":{
        "tag":"(0040,A525)",
        "name":"Identical Documents Sequence",
        "keyword":"IdenticalDocumentsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A600":{
        "tag":"(0040,A600)",
        "name":"Observation Subject Context Flag (Trial)",
        "keyword":"ObservationSubjectContextFlagTrial",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0040A601":{
        "tag":"(0040,A601)",
        "name":"Observer Context Flag (Trial)",
        "keyword":"ObserverContextFlagTrial",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0040A603":{
        "tag":"(0040,A603)",
        "name":"Procedure Context Flag (Trial)",
        "keyword":"ProcedureContextFlagTrial",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0040A730":{
        "tag":"(0040,A730)",
        "name":"Content Sequence",
        "keyword":"ContentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040A731":{
        "tag":"(0040,A731)",
        "name":"Relationship Sequence (Trial)",
        "keyword":"RelationshipSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A732":{
        "tag":"(0040,A732)",
        "name":"Relationship Type Code Sequence (Trial)",
        "keyword":"RelationshipTypeCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A744":{
        "tag":"(0040,A744)",
        "name":"Language Code Sequence (Trial)",
        "keyword":"LanguageCodeSequenceTrial",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "0040A992":{
        "tag":"(0040,A992)",
        "name":"Uniform Resource Locator (Trial)",
        "keyword":"UniformResourceLocatorTrial",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "0040B020":{
        "tag":"(0040,B020)",
        "name":"Waveform Annotation Sequence",
        "keyword":"WaveformAnnotationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040DB00":{
        "tag":"(0040,DB00)",
        "name":"Template Identifier",
        "keyword":"TemplateIdentifier",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040DB06":{
        "tag":"(0040,DB06)",
        "name":"Template Version",
        "keyword":"TemplateVersion",
        "vr":"DT",
        "vm":"1",
        "retired":true
    },
    "0040DB07":{
        "tag":"(0040,DB07)",
        "name":"Template Local Version",
        "keyword":"TemplateLocalVersion",
        "vr":"DT",
        "vm":"1",
        "retired":true
    },
    "0040DB0B":{
        "tag":"(0040,DB0B)",
        "name":"Template Extension Flag",
        "keyword":"TemplateExtensionFlag",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "0040DB0C":{
        "tag":"(0040,DB0C)",
        "name":"Template Extension Organization UID",
        "keyword":"TemplateExtensionOrganizationUID",
        "vr":"UI",
        "vm":"1",
        "retired":true
    },
    "0040DB0D":{
        "tag":"(0040,DB0D)",
        "name":"Template Extension Creator UID",
        "keyword":"TemplateExtensionCreatorUID",
        "vr":"UI",
        "vm":"1",
        "retired":true
    },
    "0040DB73":{
        "tag":"(0040,DB73)",
        "name":"Referenced Content Item Identifier",
        "keyword":"ReferencedContentItemIdentifier",
        "vr":"UL",
        "vm":"1-n",
        "retired":false
    },
    "0040E001":{
        "tag":"(0040,E001)",
        "name":"HL7 Instance Identifier",
        "keyword":"HL7InstanceIdentifier",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "0040E004":{
        "tag":"(0040,E004)",
        "name":"HL7 Document Effective Time",
        "keyword":"HL7DocumentEffectiveTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "0040E006":{
        "tag":"(0040,E006)",
        "name":"HL7 Document Type Code Sequence",
        "keyword":"HL7DocumentTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040E008":{
        "tag":"(0040,E008)",
        "name":"Document Class Code Sequence",
        "keyword":"DocumentClassCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040E010":{
        "tag":"(0040,E010)",
        "name":"Retrieve URI",
        "keyword":"RetrieveURI",
        "vr":"UR",
        "vm":"1",
        "retired":false
    },
    "0040E011":{
        "tag":"(0040,E011)",
        "name":"Retrieve Location UID",
        "keyword":"RetrieveLocationUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0040E020":{
        "tag":"(0040,E020)",
        "name":"Type of Instances",
        "keyword":"TypeOfInstances",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0040E021":{
        "tag":"(0040,E021)",
        "name":"DICOM Retrieval Sequence",
        "keyword":"DICOMRetrievalSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040E022":{
        "tag":"(0040,E022)",
        "name":"DICOM Media Retrieval Sequence",
        "keyword":"DICOMMediaRetrievalSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040E023":{
        "tag":"(0040,E023)",
        "name":"WADO Retrieval Sequence",
        "keyword":"WADORetrievalSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040E024":{
        "tag":"(0040,E024)",
        "name":"XDS Retrieval Sequence",
        "keyword":"XDSRetrievalSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040E025":{
        "tag":"(0040,E025)",
        "name":"WADO-RS Retrieval Sequence",
        "keyword":"WADORSRetrievalSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0040E030":{
        "tag":"(0040,E030)",
        "name":"Repository Unique ID",
        "keyword":"RepositoryUniqueID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0040E031":{
        "tag":"(0040,E031)",
        "name":"Home Community ID",
        "keyword":"HomeCommunityID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00420010":{
        "tag":"(0042,0010)",
        "name":"Document Title",
        "keyword":"DocumentTitle",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00420011":{
        "tag":"(0042,0011)",
        "name":"Encapsulated Document",
        "keyword":"EncapsulatedDocument",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "00420012":{
        "tag":"(0042,0012)",
        "name":"MIME Type of Encapsulated Document",
        "keyword":"MIMETypeOfEncapsulatedDocument",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00420013":{
        "tag":"(0042,0013)",
        "name":"Source Instance Sequence",
        "keyword":"SourceInstanceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00420014":{
        "tag":"(0042,0014)",
        "name":"List of MIME Types",
        "keyword":"ListOfMIMETypes",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00440001":{
        "tag":"(0044,0001)",
        "name":"Product Package Identifier",
        "keyword":"ProductPackageIdentifier",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00440002":{
        "tag":"(0044,0002)",
        "name":"Substance Administration Approval",
        "keyword":"SubstanceAdministrationApproval",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00440003":{
        "tag":"(0044,0003)",
        "name":"Approval Status Further Description",
        "keyword":"ApprovalStatusFurtherDescription",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00440004":{
        "tag":"(0044,0004)",
        "name":"Approval Status DateTime",
        "keyword":"ApprovalStatusDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00440007":{
        "tag":"(0044,0007)",
        "name":"Product Type Code Sequence",
        "keyword":"ProductTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00440008":{
        "tag":"(0044,0008)",
        "name":"Product Name",
        "keyword":"ProductName",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00440009":{
        "tag":"(0044,0009)",
        "name":"Product Description",
        "keyword":"ProductDescription",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "0044000A":{
        "tag":"(0044,000A)",
        "name":"Product Lot Identifier",
        "keyword":"ProductLotIdentifier",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0044000B":{
        "tag":"(0044,000B)",
        "name":"Product Expiration DateTime",
        "keyword":"ProductExpirationDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00440010":{
        "tag":"(0044,0010)",
        "name":"Substance Administration DateTime",
        "keyword":"SubstanceAdministrationDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00440011":{
        "tag":"(0044,0011)",
        "name":"Substance Administration Notes",
        "keyword":"SubstanceAdministrationNotes",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00440012":{
        "tag":"(0044,0012)",
        "name":"Substance Administration Device ID",
        "keyword":"SubstanceAdministrationDeviceID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00440013":{
        "tag":"(0044,0013)",
        "name":"Product Parameter Sequence",
        "keyword":"ProductParameterSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00440019":{
        "tag":"(0044,0019)",
        "name":"Substance Administration Parameter Sequence",
        "keyword":"SubstanceAdministrationParameterSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00440100":{
        "tag":"(0044,0100)",
        "name":"Approval Sequence",
        "keyword":"ApprovalSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00440101":{
        "tag":"(0044,0101)",
        "name":"Assertion Code Sequence",
        "keyword":"AssertionCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00440102":{
        "tag":"(0044,0102)",
        "name":"Assertion UID",
        "keyword":"AssertionUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00440103":{
        "tag":"(0044,0103)",
        "name":"Asserter Identification Sequence",
        "keyword":"AsserterIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00440104":{
        "tag":"(0044,0104)",
        "name":"Assertion DateTime",
        "keyword":"AssertionDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00440105":{
        "tag":"(0044,0105)",
        "name":"Assertion Expiration DateTime",
        "keyword":"AssertionExpirationDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00440106":{
        "tag":"(0044,0106)",
        "name":"Assertion Comments",
        "keyword":"AssertionComments",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00440107":{
        "tag":"(0044,0107)",
        "name":"Related Assertion Sequence",
        "keyword":"RelatedAssertionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00440108":{
        "tag":"(0044,0108)",
        "name":"Referenced Assertion UID",
        "keyword":"ReferencedAssertionUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00440109":{
        "tag":"(0044,0109)",
        "name":"Approval Subject Sequence",
        "keyword":"ApprovalSubjectSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0044010A":{
        "tag":"(0044,010A)",
        "name":"Organizational Role Code Sequence",
        "keyword":"OrganizationalRoleCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460012":{
        "tag":"(0046,0012)",
        "name":"Lens Description",
        "keyword":"LensDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00460014":{
        "tag":"(0046,0014)",
        "name":"Right Lens Sequence",
        "keyword":"RightLensSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460015":{
        "tag":"(0046,0015)",
        "name":"Left Lens Sequence",
        "keyword":"LeftLensSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460016":{
        "tag":"(0046,0016)",
        "name":"Unspecified Laterality Lens Sequence",
        "keyword":"UnspecifiedLateralityLensSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460018":{
        "tag":"(0046,0018)",
        "name":"Cylinder Sequence",
        "keyword":"CylinderSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460028":{
        "tag":"(0046,0028)",
        "name":"Prism Sequence",
        "keyword":"PrismSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460030":{
        "tag":"(0046,0030)",
        "name":"Horizontal Prism Power",
        "keyword":"HorizontalPrismPower",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460032":{
        "tag":"(0046,0032)",
        "name":"Horizontal Prism Base",
        "keyword":"HorizontalPrismBase",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00460034":{
        "tag":"(0046,0034)",
        "name":"Vertical Prism Power",
        "keyword":"VerticalPrismPower",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460036":{
        "tag":"(0046,0036)",
        "name":"Vertical Prism Base",
        "keyword":"VerticalPrismBase",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00460038":{
        "tag":"(0046,0038)",
        "name":"Lens Segment Type",
        "keyword":"LensSegmentType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00460040":{
        "tag":"(0046,0040)",
        "name":"Optical Transmittance",
        "keyword":"OpticalTransmittance",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460042":{
        "tag":"(0046,0042)",
        "name":"Channel Width",
        "keyword":"ChannelWidth",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460044":{
        "tag":"(0046,0044)",
        "name":"Pupil Size",
        "keyword":"PupilSize",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460046":{
        "tag":"(0046,0046)",
        "name":"Corneal Size",
        "keyword":"CornealSize",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460050":{
        "tag":"(0046,0050)",
        "name":"Autorefraction Right Eye Sequence",
        "keyword":"AutorefractionRightEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460052":{
        "tag":"(0046,0052)",
        "name":"Autorefraction Left Eye Sequence",
        "keyword":"AutorefractionLeftEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460060":{
        "tag":"(0046,0060)",
        "name":"Distance Pupillary Distance",
        "keyword":"DistancePupillaryDistance",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460062":{
        "tag":"(0046,0062)",
        "name":"Near Pupillary Distance",
        "keyword":"NearPupillaryDistance",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460063":{
        "tag":"(0046,0063)",
        "name":"Intermediate Pupillary Distance",
        "keyword":"IntermediatePupillaryDistance",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460064":{
        "tag":"(0046,0064)",
        "name":"Other Pupillary Distance",
        "keyword":"OtherPupillaryDistance",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460070":{
        "tag":"(0046,0070)",
        "name":"Keratometry Right Eye Sequence",
        "keyword":"KeratometryRightEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460071":{
        "tag":"(0046,0071)",
        "name":"Keratometry Left Eye Sequence",
        "keyword":"KeratometryLeftEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460074":{
        "tag":"(0046,0074)",
        "name":"Steep Keratometric Axis Sequence",
        "keyword":"SteepKeratometricAxisSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460075":{
        "tag":"(0046,0075)",
        "name":"Radius of Curvature",
        "keyword":"RadiusOfCurvature",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460076":{
        "tag":"(0046,0076)",
        "name":"Keratometric Power",
        "keyword":"KeratometricPower",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460077":{
        "tag":"(0046,0077)",
        "name":"Keratometric Axis",
        "keyword":"KeratometricAxis",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460080":{
        "tag":"(0046,0080)",
        "name":"Flat Keratometric Axis Sequence",
        "keyword":"FlatKeratometricAxisSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460092":{
        "tag":"(0046,0092)",
        "name":"Background Color",
        "keyword":"BackgroundColor",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00460094":{
        "tag":"(0046,0094)",
        "name":"Optotype",
        "keyword":"Optotype",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00460095":{
        "tag":"(0046,0095)",
        "name":"Optotype Presentation",
        "keyword":"OptotypePresentation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00460097":{
        "tag":"(0046,0097)",
        "name":"Subjective Refraction Right Eye Sequence",
        "keyword":"SubjectiveRefractionRightEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460098":{
        "tag":"(0046,0098)",
        "name":"Subjective Refraction Left Eye Sequence",
        "keyword":"SubjectiveRefractionLeftEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460100":{
        "tag":"(0046,0100)",
        "name":"Add Near Sequence",
        "keyword":"AddNearSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460101":{
        "tag":"(0046,0101)",
        "name":"Add Intermediate Sequence",
        "keyword":"AddIntermediateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460102":{
        "tag":"(0046,0102)",
        "name":"Add Other Sequence",
        "keyword":"AddOtherSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460104":{
        "tag":"(0046,0104)",
        "name":"Add Power",
        "keyword":"AddPower",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460106":{
        "tag":"(0046,0106)",
        "name":"Viewing Distance",
        "keyword":"ViewingDistance",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460121":{
        "tag":"(0046,0121)",
        "name":"Visual Acuity Type Code Sequence",
        "keyword":"VisualAcuityTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460122":{
        "tag":"(0046,0122)",
        "name":"Visual Acuity Right Eye Sequence",
        "keyword":"VisualAcuityRightEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460123":{
        "tag":"(0046,0123)",
        "name":"Visual Acuity Left Eye Sequence",
        "keyword":"VisualAcuityLeftEyeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460124":{
        "tag":"(0046,0124)",
        "name":"Visual Acuity Both Eyes Open Sequence",
        "keyword":"VisualAcuityBothEyesOpenSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460125":{
        "tag":"(0046,0125)",
        "name":"Viewing Distance Type",
        "keyword":"ViewingDistanceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00460135":{
        "tag":"(0046,0135)",
        "name":"Visual Acuity Modifiers",
        "keyword":"VisualAcuityModifiers",
        "vr":"SS",
        "vm":"2",
        "retired":false
    },
    "00460137":{
        "tag":"(0046,0137)",
        "name":"Decimal Visual Acuity",
        "keyword":"DecimalVisualAcuity",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460139":{
        "tag":"(0046,0139)",
        "name":"Optotype Detailed Definition",
        "keyword":"OptotypeDetailedDefinition",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00460145":{
        "tag":"(0046,0145)",
        "name":"Referenced Refractive Measurements Sequence",
        "keyword":"ReferencedRefractiveMeasurementsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460146":{
        "tag":"(0046,0146)",
        "name":"Sphere Power",
        "keyword":"SpherePower",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460147":{
        "tag":"(0046,0147)",
        "name":"Cylinder Power",
        "keyword":"CylinderPower",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00460201":{
        "tag":"(0046,0201)",
        "name":"Corneal Topography Surface",
        "keyword":"CornealTopographySurface",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00460202":{
        "tag":"(0046,0202)",
        "name":"Corneal Vertex Location",
        "keyword":"CornealVertexLocation",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00460203":{
        "tag":"(0046,0203)",
        "name":"Pupil Centroid X-Coordinate",
        "keyword":"PupilCentroidXCoordinate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460204":{
        "tag":"(0046,0204)",
        "name":"Pupil Centroid Y-Coordinate",
        "keyword":"PupilCentroidYCoordinate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460205":{
        "tag":"(0046,0205)",
        "name":"Equivalent Pupil Radius",
        "keyword":"EquivalentPupilRadius",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460207":{
        "tag":"(0046,0207)",
        "name":"Corneal Topography Map Type Code Sequence",
        "keyword":"CornealTopographyMapTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460208":{
        "tag":"(0046,0208)",
        "name":"Vertices of the Outline of Pupil",
        "keyword":"VerticesOfTheOutlineOfPupil",
        "vr":"IS",
        "vm":"2-2n",
        "retired":false
    },
    "00460210":{
        "tag":"(0046,0210)",
        "name":"Corneal Topography Mapping Normals Sequence",
        "keyword":"CornealTopographyMappingNormalsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460211":{
        "tag":"(0046,0211)",
        "name":"Maximum Corneal Curvature Sequence",
        "keyword":"MaximumCornealCurvatureSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460212":{
        "tag":"(0046,0212)",
        "name":"Maximum Corneal Curvature",
        "keyword":"MaximumCornealCurvature",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460213":{
        "tag":"(0046,0213)",
        "name":"Maximum Corneal Curvature Location",
        "keyword":"MaximumCornealCurvatureLocation",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00460215":{
        "tag":"(0046,0215)",
        "name":"Minimum Keratometric Sequence",
        "keyword":"MinimumKeratometricSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460218":{
        "tag":"(0046,0218)",
        "name":"Simulated Keratometric Cylinder Sequence",
        "keyword":"SimulatedKeratometricCylinderSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460220":{
        "tag":"(0046,0220)",
        "name":"Average Corneal Power",
        "keyword":"AverageCornealPower",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460224":{
        "tag":"(0046,0224)",
        "name":"Corneal I-S Value",
        "keyword":"CornealISValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460227":{
        "tag":"(0046,0227)",
        "name":"Analyzed Area",
        "keyword":"AnalyzedArea",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460230":{
        "tag":"(0046,0230)",
        "name":"Surface Regularity Index",
        "keyword":"SurfaceRegularityIndex",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460232":{
        "tag":"(0046,0232)",
        "name":"Surface Asymmetry Index",
        "keyword":"SurfaceAsymmetryIndex",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460234":{
        "tag":"(0046,0234)",
        "name":"Corneal Eccentricity Index",
        "keyword":"CornealEccentricityIndex",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460236":{
        "tag":"(0046,0236)",
        "name":"Keratoconus Prediction Index",
        "keyword":"KeratoconusPredictionIndex",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460238":{
        "tag":"(0046,0238)",
        "name":"Decimal Potential Visual Acuity",
        "keyword":"DecimalPotentialVisualAcuity",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460242":{
        "tag":"(0046,0242)",
        "name":"Corneal Topography Map Quality Evaluation",
        "keyword":"CornealTopographyMapQualityEvaluation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00460244":{
        "tag":"(0046,0244)",
        "name":"Source Image Corneal Processed Data Sequence",
        "keyword":"SourceImageCornealProcessedDataSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00460247":{
        "tag":"(0046,0247)",
        "name":"Corneal Point Location",
        "keyword":"CornealPointLocation",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "00460248":{
        "tag":"(0046,0248)",
        "name":"Corneal Point Estimated",
        "keyword":"CornealPointEstimated",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00460249":{
        "tag":"(0046,0249)",
        "name":"Axial Power",
        "keyword":"AxialPower",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460250":{
        "tag":"(0046,0250)",
        "name":"Tangential Power",
        "keyword":"TangentialPower",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460251":{
        "tag":"(0046,0251)",
        "name":"Refractive Power",
        "keyword":"RefractivePower",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460252":{
        "tag":"(0046,0252)",
        "name":"Relative Elevation",
        "keyword":"RelativeElevation",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00460253":{
        "tag":"(0046,0253)",
        "name":"Corneal Wavefront",
        "keyword":"CornealWavefront",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00480001":{
        "tag":"(0048,0001)",
        "name":"Imaged Volume Width",
        "keyword":"ImagedVolumeWidth",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00480002":{
        "tag":"(0048,0002)",
        "name":"Imaged Volume Height",
        "keyword":"ImagedVolumeHeight",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00480003":{
        "tag":"(0048,0003)",
        "name":"Imaged Volume Depth",
        "keyword":"ImagedVolumeDepth",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00480006":{
        "tag":"(0048,0006)",
        "name":"Total Pixel Matrix Columns",
        "keyword":"TotalPixelMatrixColumns",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00480007":{
        "tag":"(0048,0007)",
        "name":"Total Pixel Matrix Rows",
        "keyword":"TotalPixelMatrixRows",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00480008":{
        "tag":"(0048,0008)",
        "name":"Total Pixel Matrix Origin Sequence",
        "keyword":"TotalPixelMatrixOriginSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00480010":{
        "tag":"(0048,0010)",
        "name":"Specimen Label in Image",
        "keyword":"SpecimenLabelInImage",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00480011":{
        "tag":"(0048,0011)",
        "name":"Focus Method",
        "keyword":"FocusMethod",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00480012":{
        "tag":"(0048,0012)",
        "name":"Extended Depth of Field",
        "keyword":"ExtendedDepthOfField",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00480013":{
        "tag":"(0048,0013)",
        "name":"Number of Focal Planes",
        "keyword":"NumberOfFocalPlanes",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00480014":{
        "tag":"(0048,0014)",
        "name":"Distance Between Focal Planes",
        "keyword":"DistanceBetweenFocalPlanes",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00480015":{
        "tag":"(0048,0015)",
        "name":"Recommended Absent Pixel CIELab Value",
        "keyword":"RecommendedAbsentPixelCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00480100":{
        "tag":"(0048,0100)",
        "name":"Illuminator Type Code Sequence",
        "keyword":"IlluminatorTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00480102":{
        "tag":"(0048,0102)",
        "name":"Image Orientation (Slide)",
        "keyword":"ImageOrientationSlide",
        "vr":"DS",
        "vm":"6",
        "retired":false
    },
    "00480105":{
        "tag":"(0048,0105)",
        "name":"Optical Path Sequence",
        "keyword":"OpticalPathSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00480106":{
        "tag":"(0048,0106)",
        "name":"Optical Path Identifier",
        "keyword":"OpticalPathIdentifier",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00480107":{
        "tag":"(0048,0107)",
        "name":"Optical Path Description",
        "keyword":"OpticalPathDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00480108":{
        "tag":"(0048,0108)",
        "name":"Illumination Color Code Sequence",
        "keyword":"IlluminationColorCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00480110":{
        "tag":"(0048,0110)",
        "name":"Specimen Reference Sequence",
        "keyword":"SpecimenReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00480111":{
        "tag":"(0048,0111)",
        "name":"Condenser Lens Power",
        "keyword":"CondenserLensPower",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00480112":{
        "tag":"(0048,0112)",
        "name":"Objective Lens Power",
        "keyword":"ObjectiveLensPower",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00480113":{
        "tag":"(0048,0113)",
        "name":"Objective Lens Numerical Aperture",
        "keyword":"ObjectiveLensNumericalAperture",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00480120":{
        "tag":"(0048,0120)",
        "name":"Palette Color Lookup Table Sequence",
        "keyword":"PaletteColorLookupTableSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00480200":{
        "tag":"(0048,0200)",
        "name":"Referenced Image Navigation Sequence",
        "keyword":"ReferencedImageNavigationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00480201":{
        "tag":"(0048,0201)",
        "name":"Top Left Hand Corner of Localizer Area",
        "keyword":"TopLeftHandCornerOfLocalizerArea",
        "vr":"US",
        "vm":"2",
        "retired":false
    },
    "00480202":{
        "tag":"(0048,0202)",
        "name":"Bottom Right Hand Corner of Localizer Area",
        "keyword":"BottomRightHandCornerOfLocalizerArea",
        "vr":"US",
        "vm":"2",
        "retired":false
    },
    "00480207":{
        "tag":"(0048,0207)",
        "name":"Optical Path Identification Sequence",
        "keyword":"OpticalPathIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0048021A":{
        "tag":"(0048,021A)",
        "name":"Plane Position (Slide) Sequence",
        "keyword":"PlanePositionSlideSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0048021E":{
        "tag":"(0048,021E)",
        "name":"Column Position In Total Image Pixel Matrix",
        "keyword":"ColumnPositionInTotalImagePixelMatrix",
        "vr":"SL",
        "vm":"1",
        "retired":false
    },
    "0048021F":{
        "tag":"(0048,021F)",
        "name":"Row Position In Total Image Pixel Matrix",
        "keyword":"RowPositionInTotalImagePixelMatrix",
        "vr":"SL",
        "vm":"1",
        "retired":false
    },
    "00480301":{
        "tag":"(0048,0301)",
        "name":"Pixel Origin Interpretation",
        "keyword":"PixelOriginInterpretation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00500004":{
        "tag":"(0050,0004)",
        "name":"Calibration Image",
        "keyword":"CalibrationImage",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00500010":{
        "tag":"(0050,0010)",
        "name":"Device Sequence",
        "keyword":"DeviceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00500012":{
        "tag":"(0050,0012)",
        "name":"Container Component Type Code Sequence",
        "keyword":"ContainerComponentTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00500013":{
        "tag":"(0050,0013)",
        "name":"Container Component Thickness",
        "keyword":"ContainerComponentThickness",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00500014":{
        "tag":"(0050,0014)",
        "name":"Device Length",
        "keyword":"DeviceLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00500015":{
        "tag":"(0050,0015)",
        "name":"Container Component Width",
        "keyword":"ContainerComponentWidth",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00500016":{
        "tag":"(0050,0016)",
        "name":"Device Diameter",
        "keyword":"DeviceDiameter",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00500017":{
        "tag":"(0050,0017)",
        "name":"Device Diameter Units",
        "keyword":"DeviceDiameterUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00500018":{
        "tag":"(0050,0018)",
        "name":"Device Volume",
        "keyword":"DeviceVolume",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00500019":{
        "tag":"(0050,0019)",
        "name":"Inter-Marker Distance",
        "keyword":"InterMarkerDistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "0050001A":{
        "tag":"(0050,001A)",
        "name":"Container Component Material",
        "keyword":"ContainerComponentMaterial",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0050001B":{
        "tag":"(0050,001B)",
        "name":"Container Component ID",
        "keyword":"ContainerComponentID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0050001C":{
        "tag":"(0050,001C)",
        "name":"Container Component Length",
        "keyword":"ContainerComponentLength",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0050001D":{
        "tag":"(0050,001D)",
        "name":"Container Component Diameter",
        "keyword":"ContainerComponentDiameter",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0050001E":{
        "tag":"(0050,001E)",
        "name":"Container Component Description",
        "keyword":"ContainerComponentDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00500020":{
        "tag":"(0050,0020)",
        "name":"Device Description",
        "keyword":"DeviceDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00520001":{
        "tag":"(0052,0001)",
        "name":"Contrast/Bolus Ingredient Percent by Volume",
        "keyword":"ContrastBolusIngredientPercentByVolume",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00520002":{
        "tag":"(0052,0002)",
        "name":"OCT Focal Distance",
        "keyword":"OCTFocalDistance",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520003":{
        "tag":"(0052,0003)",
        "name":"Beam Spot Size",
        "keyword":"BeamSpotSize",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520004":{
        "tag":"(0052,0004)",
        "name":"Effective Refractive Index",
        "keyword":"EffectiveRefractiveIndex",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520006":{
        "tag":"(0052,0006)",
        "name":"OCT Acquisition Domain",
        "keyword":"OCTAcquisitionDomain",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00520007":{
        "tag":"(0052,0007)",
        "name":"OCT Optical Center Wavelength",
        "keyword":"OCTOpticalCenterWavelength",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520008":{
        "tag":"(0052,0008)",
        "name":"Axial Resolution",
        "keyword":"AxialResolution",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520009":{
        "tag":"(0052,0009)",
        "name":"Ranging Depth",
        "keyword":"RangingDepth",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520011":{
        "tag":"(0052,0011)",
        "name":"A-line Rate",
        "keyword":"ALineRate",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520012":{
        "tag":"(0052,0012)",
        "name":"A-lines Per Frame",
        "keyword":"ALinesPerFrame",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00520013":{
        "tag":"(0052,0013)",
        "name":"Catheter Rotational Rate",
        "keyword":"CatheterRotationalRate",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520014":{
        "tag":"(0052,0014)",
        "name":"A-line Pixel Spacing",
        "keyword":"ALinePixelSpacing",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520016":{
        "tag":"(0052,0016)",
        "name":"Mode of Percutaneous Access Sequence",
        "keyword":"ModeOfPercutaneousAccessSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00520025":{
        "tag":"(0052,0025)",
        "name":"Intravascular OCT Frame Type Sequence",
        "keyword":"IntravascularOCTFrameTypeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00520026":{
        "tag":"(0052,0026)",
        "name":"OCT Z Offset Applied",
        "keyword":"OCTZOffsetApplied",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00520027":{
        "tag":"(0052,0027)",
        "name":"Intravascular Frame Content Sequence",
        "keyword":"IntravascularFrameContentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00520028":{
        "tag":"(0052,0028)",
        "name":"Intravascular Longitudinal Distance",
        "keyword":"IntravascularLongitudinalDistance",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520029":{
        "tag":"(0052,0029)",
        "name":"Intravascular OCT Frame Content Sequence",
        "keyword":"IntravascularOCTFrameContentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00520030":{
        "tag":"(0052,0030)",
        "name":"OCT Z Offset Correction",
        "keyword":"OCTZOffsetCorrection",
        "vr":"SS",
        "vm":"1",
        "retired":false
    },
    "00520031":{
        "tag":"(0052,0031)",
        "name":"Catheter Direction of Rotation",
        "keyword":"CatheterDirectionOfRotation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00520033":{
        "tag":"(0052,0033)",
        "name":"Seam Line Location",
        "keyword":"SeamLineLocation",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520034":{
        "tag":"(0052,0034)",
        "name":"First A-line Location",
        "keyword":"FirstALineLocation",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00520036":{
        "tag":"(0052,0036)",
        "name":"Seam Line Index",
        "keyword":"SeamLineIndex",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00520038":{
        "tag":"(0052,0038)",
        "name":"Number of Padded A-lines",
        "keyword":"NumberOfPaddedALines",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00520039":{
        "tag":"(0052,0039)",
        "name":"Interpolation Type",
        "keyword":"InterpolationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0052003A":{
        "tag":"(0052,003A)",
        "name":"Refractive Index Applied",
        "keyword":"RefractiveIndexApplied",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00540010":{
        "tag":"(0054,0010)",
        "name":"Energy Window Vector",
        "keyword":"EnergyWindowVector",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00540011":{
        "tag":"(0054,0011)",
        "name":"Number of Energy Windows",
        "keyword":"NumberOfEnergyWindows",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540012":{
        "tag":"(0054,0012)",
        "name":"Energy Window Information Sequence",
        "keyword":"EnergyWindowInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540013":{
        "tag":"(0054,0013)",
        "name":"Energy Window Range Sequence",
        "keyword":"EnergyWindowRangeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540014":{
        "tag":"(0054,0014)",
        "name":"Energy Window Lower Limit",
        "keyword":"EnergyWindowLowerLimit",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00540015":{
        "tag":"(0054,0015)",
        "name":"Energy Window Upper Limit",
        "keyword":"EnergyWindowUpperLimit",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00540016":{
        "tag":"(0054,0016)",
        "name":"Radiopharmaceutical Information Sequence",
        "keyword":"RadiopharmaceuticalInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540017":{
        "tag":"(0054,0017)",
        "name":"Residual Syringe Counts",
        "keyword":"ResidualSyringeCounts",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00540018":{
        "tag":"(0054,0018)",
        "name":"Energy Window Name",
        "keyword":"EnergyWindowName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00540020":{
        "tag":"(0054,0020)",
        "name":"Detector Vector",
        "keyword":"DetectorVector",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00540021":{
        "tag":"(0054,0021)",
        "name":"Number of Detectors",
        "keyword":"NumberOfDetectors",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540022":{
        "tag":"(0054,0022)",
        "name":"Detector Information Sequence",
        "keyword":"DetectorInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540030":{
        "tag":"(0054,0030)",
        "name":"Phase Vector",
        "keyword":"PhaseVector",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00540031":{
        "tag":"(0054,0031)",
        "name":"Number of Phases",
        "keyword":"NumberOfPhases",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540032":{
        "tag":"(0054,0032)",
        "name":"Phase Information Sequence",
        "keyword":"PhaseInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540033":{
        "tag":"(0054,0033)",
        "name":"Number of Frames in Phase",
        "keyword":"NumberOfFramesInPhase",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540036":{
        "tag":"(0054,0036)",
        "name":"Phase Delay",
        "keyword":"PhaseDelay",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00540038":{
        "tag":"(0054,0038)",
        "name":"Pause Between Frames",
        "keyword":"PauseBetweenFrames",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00540039":{
        "tag":"(0054,0039)",
        "name":"Phase Description",
        "keyword":"PhaseDescription",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00540050":{
        "tag":"(0054,0050)",
        "name":"Rotation Vector",
        "keyword":"RotationVector",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00540051":{
        "tag":"(0054,0051)",
        "name":"Number of Rotations",
        "keyword":"NumberOfRotations",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540052":{
        "tag":"(0054,0052)",
        "name":"Rotation Information Sequence",
        "keyword":"RotationInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540053":{
        "tag":"(0054,0053)",
        "name":"Number of Frames in Rotation",
        "keyword":"NumberOfFramesInRotation",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540060":{
        "tag":"(0054,0060)",
        "name":"R-R Interval Vector",
        "keyword":"RRIntervalVector",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00540061":{
        "tag":"(0054,0061)",
        "name":"Number of R-R Intervals",
        "keyword":"NumberOfRRIntervals",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540062":{
        "tag":"(0054,0062)",
        "name":"Gated Information Sequence",
        "keyword":"GatedInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540063":{
        "tag":"(0054,0063)",
        "name":"Data Information Sequence",
        "keyword":"DataInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540070":{
        "tag":"(0054,0070)",
        "name":"Time Slot Vector",
        "keyword":"TimeSlotVector",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00540071":{
        "tag":"(0054,0071)",
        "name":"Number of Time Slots",
        "keyword":"NumberOfTimeSlots",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540072":{
        "tag":"(0054,0072)",
        "name":"Time Slot Information Sequence",
        "keyword":"TimeSlotInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540073":{
        "tag":"(0054,0073)",
        "name":"Time Slot Time",
        "keyword":"TimeSlotTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00540080":{
        "tag":"(0054,0080)",
        "name":"Slice Vector",
        "keyword":"SliceVector",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00540081":{
        "tag":"(0054,0081)",
        "name":"Number of Slices",
        "keyword":"NumberOfSlices",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540090":{
        "tag":"(0054,0090)",
        "name":"Angular View Vector",
        "keyword":"AngularViewVector",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00540100":{
        "tag":"(0054,0100)",
        "name":"Time Slice Vector",
        "keyword":"TimeSliceVector",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00540101":{
        "tag":"(0054,0101)",
        "name":"Number of Time Slices",
        "keyword":"NumberOfTimeSlices",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540200":{
        "tag":"(0054,0200)",
        "name":"Start Angle",
        "keyword":"StartAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00540202":{
        "tag":"(0054,0202)",
        "name":"Type of Detector Motion",
        "keyword":"TypeOfDetectorMotion",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00540210":{
        "tag":"(0054,0210)",
        "name":"Trigger Vector",
        "keyword":"TriggerVector",
        "vr":"IS",
        "vm":"1-n",
        "retired":false
    },
    "00540211":{
        "tag":"(0054,0211)",
        "name":"Number of Triggers in Phase",
        "keyword":"NumberOfTriggersInPhase",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540220":{
        "tag":"(0054,0220)",
        "name":"View Code Sequence",
        "keyword":"ViewCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540222":{
        "tag":"(0054,0222)",
        "name":"View Modifier Code Sequence",
        "keyword":"ViewModifierCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540300":{
        "tag":"(0054,0300)",
        "name":"Radionuclide Code Sequence",
        "keyword":"RadionuclideCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540302":{
        "tag":"(0054,0302)",
        "name":"Administration Route Code Sequence",
        "keyword":"AdministrationRouteCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540304":{
        "tag":"(0054,0304)",
        "name":"Radiopharmaceutical Code Sequence",
        "keyword":"RadiopharmaceuticalCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540306":{
        "tag":"(0054,0306)",
        "name":"Calibration Data Sequence",
        "keyword":"CalibrationDataSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540308":{
        "tag":"(0054,0308)",
        "name":"Energy Window Number",
        "keyword":"EnergyWindowNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00540400":{
        "tag":"(0054,0400)",
        "name":"Image ID",
        "keyword":"ImageID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00540410":{
        "tag":"(0054,0410)",
        "name":"Patient Orientation Code Sequence",
        "keyword":"PatientOrientationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540412":{
        "tag":"(0054,0412)",
        "name":"Patient Orientation Modifier Code Sequence",
        "keyword":"PatientOrientationModifierCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540414":{
        "tag":"(0054,0414)",
        "name":"Patient Gantry Relationship Code Sequence",
        "keyword":"PatientGantryRelationshipCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00540500":{
        "tag":"(0054,0500)",
        "name":"Slice Progression Direction",
        "keyword":"SliceProgressionDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00540501":{
        "tag":"(0054,0501)",
        "name":"Scan Progression Direction",
        "keyword":"ScanProgressionDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00541000":{
        "tag":"(0054,1000)",
        "name":"Series Type",
        "keyword":"SeriesType",
        "vr":"CS",
        "vm":"2",
        "retired":false
    },
    "00541001":{
        "tag":"(0054,1001)",
        "name":"Units",
        "keyword":"Units",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00541002":{
        "tag":"(0054,1002)",
        "name":"Counts Source",
        "keyword":"CountsSource",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00541004":{
        "tag":"(0054,1004)",
        "name":"Reprojection Method",
        "keyword":"ReprojectionMethod",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00541006":{
        "tag":"(0054,1006)",
        "name":"SUV Type",
        "keyword":"SUVType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00541100":{
        "tag":"(0054,1100)",
        "name":"Randoms Correction Method",
        "keyword":"RandomsCorrectionMethod",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00541101":{
        "tag":"(0054,1101)",
        "name":"Attenuation Correction Method",
        "keyword":"AttenuationCorrectionMethod",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00541102":{
        "tag":"(0054,1102)",
        "name":"Decay Correction",
        "keyword":"DecayCorrection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00541103":{
        "tag":"(0054,1103)",
        "name":"Reconstruction Method",
        "keyword":"ReconstructionMethod",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00541104":{
        "tag":"(0054,1104)",
        "name":"Detector Lines of Response Used",
        "keyword":"DetectorLinesOfResponseUsed",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00541105":{
        "tag":"(0054,1105)",
        "name":"Scatter Correction Method",
        "keyword":"ScatterCorrectionMethod",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00541200":{
        "tag":"(0054,1200)",
        "name":"Axial Acceptance",
        "keyword":"AxialAcceptance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00541201":{
        "tag":"(0054,1201)",
        "name":"Axial Mash",
        "keyword":"AxialMash",
        "vr":"IS",
        "vm":"2",
        "retired":false
    },
    "00541202":{
        "tag":"(0054,1202)",
        "name":"Transverse Mash",
        "keyword":"TransverseMash",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00541203":{
        "tag":"(0054,1203)",
        "name":"Detector Element Size",
        "keyword":"DetectorElementSize",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "00541210":{
        "tag":"(0054,1210)",
        "name":"Coincidence Window Width",
        "keyword":"CoincidenceWindowWidth",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00541220":{
        "tag":"(0054,1220)",
        "name":"Secondary Counts Type",
        "keyword":"SecondaryCountsType",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00541300":{
        "tag":"(0054,1300)",
        "name":"Frame Reference Time",
        "keyword":"FrameReferenceTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00541310":{
        "tag":"(0054,1310)",
        "name":"Primary (Prompts) Counts Accumulated",
        "keyword":"PrimaryPromptsCountsAccumulated",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00541311":{
        "tag":"(0054,1311)",
        "name":"Secondary Counts Accumulated",
        "keyword":"SecondaryCountsAccumulated",
        "vr":"IS",
        "vm":"1-n",
        "retired":false
    },
    "00541320":{
        "tag":"(0054,1320)",
        "name":"Slice Sensitivity Factor",
        "keyword":"SliceSensitivityFactor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00541321":{
        "tag":"(0054,1321)",
        "name":"Decay Factor",
        "keyword":"DecayFactor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00541322":{
        "tag":"(0054,1322)",
        "name":"Dose Calibration Factor",
        "keyword":"DoseCalibrationFactor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00541323":{
        "tag":"(0054,1323)",
        "name":"Scatter Fraction Factor",
        "keyword":"ScatterFractionFactor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00541324":{
        "tag":"(0054,1324)",
        "name":"Dead Time Factor",
        "keyword":"DeadTimeFactor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00541330":{
        "tag":"(0054,1330)",
        "name":"Image Index",
        "keyword":"ImageIndex",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00541400":{
        "tag":"(0054,1400)",
        "name":"Counts Included",
        "keyword":"CountsIncluded",
        "vr":"CS",
        "vm":"1-n",
        "retired":true
    },
    "00541401":{
        "tag":"(0054,1401)",
        "name":"Dead Time Correction Flag",
        "keyword":"DeadTimeCorrectionFlag",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00603000":{
        "tag":"(0060,3000)",
        "name":"Histogram Sequence",
        "keyword":"HistogramSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00603002":{
        "tag":"(0060,3002)",
        "name":"Histogram Number of Bins",
        "keyword":"HistogramNumberOfBins",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00603004":{
        "tag":"(0060,3004)",
        "name":"Histogram First Bin Value",
        "keyword":"HistogramFirstBinValue",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00603006":{
        "tag":"(0060,3006)",
        "name":"Histogram Last Bin Value",
        "keyword":"HistogramLastBinValue",
        "vr":"US or SS",
        "vm":"1",
        "retired":false
    },
    "00603008":{
        "tag":"(0060,3008)",
        "name":"Histogram Bin Width",
        "keyword":"HistogramBinWidth",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00603010":{
        "tag":"(0060,3010)",
        "name":"Histogram Explanation",
        "keyword":"HistogramExplanation",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00603020":{
        "tag":"(0060,3020)",
        "name":"Histogram Data",
        "keyword":"HistogramData",
        "vr":"UL",
        "vm":"1-n",
        "retired":false
    },
    "00620001":{
        "tag":"(0062,0001)",
        "name":"Segmentation Type",
        "keyword":"SegmentationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00620002":{
        "tag":"(0062,0002)",
        "name":"Segment Sequence",
        "keyword":"SegmentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00620003":{
        "tag":"(0062,0003)",
        "name":"Segmented Property Category Code Sequence",
        "keyword":"SegmentedPropertyCategoryCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00620004":{
        "tag":"(0062,0004)",
        "name":"Segment Number",
        "keyword":"SegmentNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00620005":{
        "tag":"(0062,0005)",
        "name":"Segment Label",
        "keyword":"SegmentLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00620006":{
        "tag":"(0062,0006)",
        "name":"Segment Description",
        "keyword":"SegmentDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00620007":{
        "tag":"(0062,0007)",
        "name":"Segmentation Algorithm Identification Sequence",
        "keyword":"SegmentationAlgorithmIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00620008":{
        "tag":"(0062,0008)",
        "name":"Segment Algorithm Type",
        "keyword":"SegmentAlgorithmType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00620009":{
        "tag":"(0062,0009)",
        "name":"Segment Algorithm Name",
        "keyword":"SegmentAlgorithmName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0062000A":{
        "tag":"(0062,000A)",
        "name":"Segment Identification Sequence",
        "keyword":"SegmentIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0062000B":{
        "tag":"(0062,000B)",
        "name":"Referenced Segment Number",
        "keyword":"ReferencedSegmentNumber",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "0062000C":{
        "tag":"(0062,000C)",
        "name":"Recommended Display Grayscale Value",
        "keyword":"RecommendedDisplayGrayscaleValue",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "0062000D":{
        "tag":"(0062,000D)",
        "name":"Recommended Display CIELab Value",
        "keyword":"RecommendedDisplayCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "0062000E":{
        "tag":"(0062,000E)",
        "name":"Maximum Fractional Value",
        "keyword":"MaximumFractionalValue",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "0062000F":{
        "tag":"(0062,000F)",
        "name":"Segmented Property Type Code Sequence",
        "keyword":"SegmentedPropertyTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00620010":{
        "tag":"(0062,0010)",
        "name":"Segmentation Fractional Type",
        "keyword":"SegmentationFractionalType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00620011":{
        "tag":"(0062,0011)",
        "name":"Segmented Property Type Modifier Code Sequence",
        "keyword":"SegmentedPropertyTypeModifierCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00620012":{
        "tag":"(0062,0012)",
        "name":"Used Segments Sequence",
        "keyword":"UsedSegmentsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00620020":{
        "tag":"(0062,0020)",
        "name":"Tracking ID",
        "keyword":"TrackingID",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00620021":{
        "tag":"(0062,0021)",
        "name":"Tracking UID",
        "keyword":"TrackingUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00640002":{
        "tag":"(0064,0002)",
        "name":"Deformable Registration Sequence",
        "keyword":"DeformableRegistrationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00640003":{
        "tag":"(0064,0003)",
        "name":"Source Frame of Reference UID",
        "keyword":"SourceFrameOfReferenceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00640005":{
        "tag":"(0064,0005)",
        "name":"Deformable Registration Grid Sequence",
        "keyword":"DeformableRegistrationGridSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00640007":{
        "tag":"(0064,0007)",
        "name":"Grid Dimensions",
        "keyword":"GridDimensions",
        "vr":"UL",
        "vm":"3",
        "retired":false
    },
    "00640008":{
        "tag":"(0064,0008)",
        "name":"Grid Resolution",
        "keyword":"GridResolution",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00640009":{
        "tag":"(0064,0009)",
        "name":"Vector Grid Data",
        "keyword":"VectorGridData",
        "vr":"OF",
        "vm":"1",
        "retired":false
    },
    "0064000F":{
        "tag":"(0064,000F)",
        "name":"Pre Deformation Matrix Registration Sequence",
        "keyword":"PreDeformationMatrixRegistrationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00640010":{
        "tag":"(0064,0010)",
        "name":"Post Deformation Matrix Registration Sequence",
        "keyword":"PostDeformationMatrixRegistrationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660001":{
        "tag":"(0066,0001)",
        "name":"Number of Surfaces",
        "keyword":"NumberOfSurfaces",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00660002":{
        "tag":"(0066,0002)",
        "name":"Surface Sequence",
        "keyword":"SurfaceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660003":{
        "tag":"(0066,0003)",
        "name":"Surface Number",
        "keyword":"SurfaceNumber",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00660004":{
        "tag":"(0066,0004)",
        "name":"Surface Comments",
        "keyword":"SurfaceComments",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00660009":{
        "tag":"(0066,0009)",
        "name":"Surface Processing",
        "keyword":"SurfaceProcessing",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0066000A":{
        "tag":"(0066,000A)",
        "name":"Surface Processing Ratio",
        "keyword":"SurfaceProcessingRatio",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "0066000B":{
        "tag":"(0066,000B)",
        "name":"Surface Processing Description",
        "keyword":"SurfaceProcessingDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0066000C":{
        "tag":"(0066,000C)",
        "name":"Recommended Presentation Opacity",
        "keyword":"RecommendedPresentationOpacity",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "0066000D":{
        "tag":"(0066,000D)",
        "name":"Recommended Presentation Type",
        "keyword":"RecommendedPresentationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0066000E":{
        "tag":"(0066,000E)",
        "name":"Finite Volume",
        "keyword":"FiniteVolume",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00660010":{
        "tag":"(0066,0010)",
        "name":"Manifold",
        "keyword":"Manifold",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00660011":{
        "tag":"(0066,0011)",
        "name":"Surface Points Sequence",
        "keyword":"SurfacePointsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660012":{
        "tag":"(0066,0012)",
        "name":"Surface Points Normals Sequence",
        "keyword":"SurfacePointsNormalsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660013":{
        "tag":"(0066,0013)",
        "name":"Surface Mesh Primitives Sequence",
        "keyword":"SurfaceMeshPrimitivesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660015":{
        "tag":"(0066,0015)",
        "name":"Number of Surface Points",
        "keyword":"NumberOfSurfacePoints",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00660016":{
        "tag":"(0066,0016)",
        "name":"Point Coordinates Data",
        "keyword":"PointCoordinatesData",
        "vr":"OF",
        "vm":"1",
        "retired":false
    },
    "00660017":{
        "tag":"(0066,0017)",
        "name":"Point Position Accuracy",
        "keyword":"PointPositionAccuracy",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "00660018":{
        "tag":"(0066,0018)",
        "name":"Mean Point Distance",
        "keyword":"MeanPointDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00660019":{
        "tag":"(0066,0019)",
        "name":"Maximum Point Distance",
        "keyword":"MaximumPointDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "0066001A":{
        "tag":"(0066,001A)",
        "name":"Points Bounding Box Coordinates",
        "keyword":"PointsBoundingBoxCoordinates",
        "vr":"FL",
        "vm":"6",
        "retired":false
    },
    "0066001B":{
        "tag":"(0066,001B)",
        "name":"Axis of Rotation",
        "keyword":"AxisOfRotation",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "0066001C":{
        "tag":"(0066,001C)",
        "name":"Center of Rotation",
        "keyword":"CenterOfRotation",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "0066001E":{
        "tag":"(0066,001E)",
        "name":"Number of Vectors",
        "keyword":"NumberOfVectors",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "0066001F":{
        "tag":"(0066,001F)",
        "name":"Vector Dimensionality",
        "keyword":"VectorDimensionality",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00660020":{
        "tag":"(0066,0020)",
        "name":"Vector Accuracy",
        "keyword":"VectorAccuracy",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "00660021":{
        "tag":"(0066,0021)",
        "name":"Vector Coordinate Data",
        "keyword":"VectorCoordinateData",
        "vr":"OF",
        "vm":"1",
        "retired":false
    },
    "00660023":{
        "tag":"(0066,0023)",
        "name":"Triangle Point Index List",
        "keyword":"TrianglePointIndexList",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "00660024":{
        "tag":"(0066,0024)",
        "name":"Edge Point Index List",
        "keyword":"EdgePointIndexList",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "00660025":{
        "tag":"(0066,0025)",
        "name":"Vertex Point Index List",
        "keyword":"VertexPointIndexList",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "00660026":{
        "tag":"(0066,0026)",
        "name":"Triangle Strip Sequence",
        "keyword":"TriangleStripSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660027":{
        "tag":"(0066,0027)",
        "name":"Triangle Fan Sequence",
        "keyword":"TriangleFanSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660028":{
        "tag":"(0066,0028)",
        "name":"Line Sequence",
        "keyword":"LineSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660029":{
        "tag":"(0066,0029)",
        "name":"Primitive Point Index List",
        "keyword":"PrimitivePointIndexList",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "0066002A":{
        "tag":"(0066,002A)",
        "name":"Surface Count",
        "keyword":"SurfaceCount",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "0066002B":{
        "tag":"(0066,002B)",
        "name":"Referenced Surface Sequence",
        "keyword":"ReferencedSurfaceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0066002C":{
        "tag":"(0066,002C)",
        "name":"Referenced Surface Number",
        "keyword":"ReferencedSurfaceNumber",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "0066002D":{
        "tag":"(0066,002D)",
        "name":"Segment Surface Generation Algorithm Identification Sequence",
        "keyword":"SegmentSurfaceGenerationAlgorithmIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0066002E":{
        "tag":"(0066,002E)",
        "name":"Segment Surface Source Instance Sequence",
        "keyword":"SegmentSurfaceSourceInstanceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0066002F":{
        "tag":"(0066,002F)",
        "name":"Algorithm Family Code Sequence",
        "keyword":"AlgorithmFamilyCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660030":{
        "tag":"(0066,0030)",
        "name":"Algorithm Name Code Sequence",
        "keyword":"AlgorithmNameCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660031":{
        "tag":"(0066,0031)",
        "name":"Algorithm Version",
        "keyword":"AlgorithmVersion",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00660032":{
        "tag":"(0066,0032)",
        "name":"Algorithm Parameters",
        "keyword":"AlgorithmParameters",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00660034":{
        "tag":"(0066,0034)",
        "name":"Facet Sequence",
        "keyword":"FacetSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660035":{
        "tag":"(0066,0035)",
        "name":"Surface Processing Algorithm Identification Sequence",
        "keyword":"SurfaceProcessingAlgorithmIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660036":{
        "tag":"(0066,0036)",
        "name":"Algorithm Name",
        "keyword":"AlgorithmName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00660037":{
        "tag":"(0066,0037)",
        "name":"Recommended Point Radius",
        "keyword":"RecommendedPointRadius",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00660038":{
        "tag":"(0066,0038)",
        "name":"Recommended Line Thickness",
        "keyword":"RecommendedLineThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00660040":{
        "tag":"(0066,0040)",
        "name":"Long Primitive Point Index List",
        "keyword":"LongPrimitivePointIndexList",
        "vr":"OL",
        "vm":"1",
        "retired":false
    },
    "00660041":{
        "tag":"(0066,0041)",
        "name":"Long Triangle Point Index List",
        "keyword":"LongTrianglePointIndexList",
        "vr":"OL",
        "vm":"1",
        "retired":false
    },
    "00660042":{
        "tag":"(0066,0042)",
        "name":"Long Edge Point Index List",
        "keyword":"LongEdgePointIndexList",
        "vr":"OL",
        "vm":"1",
        "retired":false
    },
    "00660043":{
        "tag":"(0066,0043)",
        "name":"Long Vertex Point Index List",
        "keyword":"LongVertexPointIndexList",
        "vr":"OL",
        "vm":"1",
        "retired":false
    },
    "00660101":{
        "tag":"(0066,0101)",
        "name":"Track Set Sequence",
        "keyword":"TrackSetSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660102":{
        "tag":"(0066,0102)",
        "name":"Track Sequence",
        "keyword":"TrackSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660103":{
        "tag":"(0066,0103)",
        "name":"Recommended Display CIELab Value List",
        "keyword":"RecommendedDisplayCIELabValueList",
        "vr":"OW",
        "vm":"1",
        "retired":false
    },
    "00660104":{
        "tag":"(0066,0104)",
        "name":"Tracking Algorithm Identification Sequence",
        "keyword":"TrackingAlgorithmIdentificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660105":{
        "tag":"(0066,0105)",
        "name":"Track Set Number",
        "keyword":"TrackSetNumber",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00660106":{
        "tag":"(0066,0106)",
        "name":"Track Set Label",
        "keyword":"TrackSetLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00660107":{
        "tag":"(0066,0107)",
        "name":"Track Set Description",
        "keyword":"TrackSetDescription",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00660108":{
        "tag":"(0066,0108)",
        "name":"Track Set Anatomical Type Code Sequence",
        "keyword":"TrackSetAnatomicalTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660121":{
        "tag":"(0066,0121)",
        "name":"Measurements Sequence",
        "keyword":"MeasurementsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660124":{
        "tag":"(0066,0124)",
        "name":"Track Set Statistics Sequence",
        "keyword":"TrackSetStatisticsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660125":{
        "tag":"(0066,0125)",
        "name":"Floating Point Values",
        "keyword":"FloatingPointValues",
        "vr":"OF",
        "vm":"1",
        "retired":false
    },
    "00660129":{
        "tag":"(0066,0129)",
        "name":"Track Point Index List",
        "keyword":"TrackPointIndexList",
        "vr":"OL",
        "vm":"1",
        "retired":false
    },
    "00660130":{
        "tag":"(0066,0130)",
        "name":"Track Statistics Sequence",
        "keyword":"TrackStatisticsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660132":{
        "tag":"(0066,0132)",
        "name":"Measurement Values Sequence",
        "keyword":"MeasurementValuesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660133":{
        "tag":"(0066,0133)",
        "name":"Diffusion Acquisition Code Sequence",
        "keyword":"DiffusionAcquisitionCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00660134":{
        "tag":"(0066,0134)",
        "name":"Diffusion Model Code Sequence",
        "keyword":"DiffusionModelCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686210":{
        "tag":"(0068,6210)",
        "name":"Implant Size",
        "keyword":"ImplantSize",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00686221":{
        "tag":"(0068,6221)",
        "name":"Implant Template Version",
        "keyword":"ImplantTemplateVersion",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00686222":{
        "tag":"(0068,6222)",
        "name":"Replaced Implant Template Sequence",
        "keyword":"ReplacedImplantTemplateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686223":{
        "tag":"(0068,6223)",
        "name":"Implant Type",
        "keyword":"ImplantType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00686224":{
        "tag":"(0068,6224)",
        "name":"Derivation Implant Template Sequence",
        "keyword":"DerivationImplantTemplateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686225":{
        "tag":"(0068,6225)",
        "name":"Original Implant Template Sequence",
        "keyword":"OriginalImplantTemplateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686226":{
        "tag":"(0068,6226)",
        "name":"Effective DateTime",
        "keyword":"EffectiveDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00686230":{
        "tag":"(0068,6230)",
        "name":"Implant Target Anatomy Sequence",
        "keyword":"ImplantTargetAnatomySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686260":{
        "tag":"(0068,6260)",
        "name":"Information From Manufacturer Sequence",
        "keyword":"InformationFromManufacturerSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686265":{
        "tag":"(0068,6265)",
        "name":"Notification From Manufacturer Sequence",
        "keyword":"NotificationFromManufacturerSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686270":{
        "tag":"(0068,6270)",
        "name":"Information Issue DateTime",
        "keyword":"InformationIssueDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "00686280":{
        "tag":"(0068,6280)",
        "name":"Information Summary",
        "keyword":"InformationSummary",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "006862A0":{
        "tag":"(0068,62A0)",
        "name":"Implant Regulatory Disapproval Code Sequence",
        "keyword":"ImplantRegulatoryDisapprovalCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006862A5":{
        "tag":"(0068,62A5)",
        "name":"Overall Template Spatial Tolerance",
        "keyword":"OverallTemplateSpatialTolerance",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "006862C0":{
        "tag":"(0068,62C0)",
        "name":"HPGL Document Sequence",
        "keyword":"HPGLDocumentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006862D0":{
        "tag":"(0068,62D0)",
        "name":"HPGL Document ID",
        "keyword":"HPGLDocumentID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "006862D5":{
        "tag":"(0068,62D5)",
        "name":"HPGL Document Label",
        "keyword":"HPGLDocumentLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "006862E0":{
        "tag":"(0068,62E0)",
        "name":"View Orientation Code Sequence",
        "keyword":"ViewOrientationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006862F0":{
        "tag":"(0068,62F0)",
        "name":"View Orientation Modifier Code Sequence",
        "keyword":"ViewOrientationModifierCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006862F2":{
        "tag":"(0068,62F2)",
        "name":"HPGL Document Scaling",
        "keyword":"HPGLDocumentScaling",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00686300":{
        "tag":"(0068,6300)",
        "name":"HPGL Document",
        "keyword":"HPGLDocument",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "00686310":{
        "tag":"(0068,6310)",
        "name":"HPGL Contour Pen Number",
        "keyword":"HPGLContourPenNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00686320":{
        "tag":"(0068,6320)",
        "name":"HPGL Pen Sequence",
        "keyword":"HPGLPenSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686330":{
        "tag":"(0068,6330)",
        "name":"HPGL Pen Number",
        "keyword":"HPGLPenNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00686340":{
        "tag":"(0068,6340)",
        "name":"HPGL Pen Label",
        "keyword":"HPGLPenLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00686345":{
        "tag":"(0068,6345)",
        "name":"HPGL Pen Description",
        "keyword":"HPGLPenDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00686346":{
        "tag":"(0068,6346)",
        "name":"Recommended Rotation Point",
        "keyword":"RecommendedRotationPoint",
        "vr":"FD",
        "vm":"2",
        "retired":false
    },
    "00686347":{
        "tag":"(0068,6347)",
        "name":"Bounding Rectangle",
        "keyword":"BoundingRectangle",
        "vr":"FD",
        "vm":"4",
        "retired":false
    },
    "00686350":{
        "tag":"(0068,6350)",
        "name":"Implant Template 3D Model Surface Number",
        "keyword":"ImplantTemplate3DModelSurfaceNumber",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00686360":{
        "tag":"(0068,6360)",
        "name":"Surface Model Description Sequence",
        "keyword":"SurfaceModelDescriptionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686380":{
        "tag":"(0068,6380)",
        "name":"Surface Model Label",
        "keyword":"SurfaceModelLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00686390":{
        "tag":"(0068,6390)",
        "name":"Surface Model Scaling Factor",
        "keyword":"SurfaceModelScalingFactor",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "006863A0":{
        "tag":"(0068,63A0)",
        "name":"Materials Code Sequence",
        "keyword":"MaterialsCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006863A4":{
        "tag":"(0068,63A4)",
        "name":"Coating Materials Code Sequence",
        "keyword":"CoatingMaterialsCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006863A8":{
        "tag":"(0068,63A8)",
        "name":"Implant Type Code Sequence",
        "keyword":"ImplantTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006863AC":{
        "tag":"(0068,63AC)",
        "name":"Fixation Method Code Sequence",
        "keyword":"FixationMethodCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006863B0":{
        "tag":"(0068,63B0)",
        "name":"Mating Feature Sets Sequence",
        "keyword":"MatingFeatureSetsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006863C0":{
        "tag":"(0068,63C0)",
        "name":"Mating Feature Set ID",
        "keyword":"MatingFeatureSetID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "006863D0":{
        "tag":"(0068,63D0)",
        "name":"Mating Feature Set Label",
        "keyword":"MatingFeatureSetLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "006863E0":{
        "tag":"(0068,63E0)",
        "name":"Mating Feature Sequence",
        "keyword":"MatingFeatureSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006863F0":{
        "tag":"(0068,63F0)",
        "name":"Mating Feature ID",
        "keyword":"MatingFeatureID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00686400":{
        "tag":"(0068,6400)",
        "name":"Mating Feature Degree of Freedom Sequence",
        "keyword":"MatingFeatureDegreeOfFreedomSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686410":{
        "tag":"(0068,6410)",
        "name":"Degree of Freedom ID",
        "keyword":"DegreeOfFreedomID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00686420":{
        "tag":"(0068,6420)",
        "name":"Degree of Freedom Type",
        "keyword":"DegreeOfFreedomType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00686430":{
        "tag":"(0068,6430)",
        "name":"2D Mating Feature Coordinates Sequence",
        "keyword":"TwoDMatingFeatureCoordinatesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686440":{
        "tag":"(0068,6440)",
        "name":"Referenced HPGL Document ID",
        "keyword":"ReferencedHPGLDocumentID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00686450":{
        "tag":"(0068,6450)",
        "name":"2D Mating Point",
        "keyword":"TwoDMatingPoint",
        "vr":"FD",
        "vm":"2",
        "retired":false
    },
    "00686460":{
        "tag":"(0068,6460)",
        "name":"2D Mating Axes",
        "keyword":"TwoDMatingAxes",
        "vr":"FD",
        "vm":"4",
        "retired":false
    },
    "00686470":{
        "tag":"(0068,6470)",
        "name":"2D Degree of Freedom Sequence",
        "keyword":"TwoDDegreeOfFreedomSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686490":{
        "tag":"(0068,6490)",
        "name":"3D Degree of Freedom Axis",
        "keyword":"ThreeDDegreeOfFreedomAxis",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "006864A0":{
        "tag":"(0068,64A0)",
        "name":"Range of Freedom",
        "keyword":"RangeOfFreedom",
        "vr":"FD",
        "vm":"2",
        "retired":false
    },
    "006864C0":{
        "tag":"(0068,64C0)",
        "name":"3D Mating Point",
        "keyword":"ThreeDMatingPoint",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "006864D0":{
        "tag":"(0068,64D0)",
        "name":"3D Mating Axes",
        "keyword":"ThreeDMatingAxes",
        "vr":"FD",
        "vm":"9",
        "retired":false
    },
    "006864F0":{
        "tag":"(0068,64F0)",
        "name":"2D Degree of Freedom Axis",
        "keyword":"TwoDDegreeOfFreedomAxis",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00686500":{
        "tag":"(0068,6500)",
        "name":"Planning Landmark Point Sequence",
        "keyword":"PlanningLandmarkPointSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686510":{
        "tag":"(0068,6510)",
        "name":"Planning Landmark Line Sequence",
        "keyword":"PlanningLandmarkLineSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686520":{
        "tag":"(0068,6520)",
        "name":"Planning Landmark Plane Sequence",
        "keyword":"PlanningLandmarkPlaneSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686530":{
        "tag":"(0068,6530)",
        "name":"Planning Landmark ID",
        "keyword":"PlanningLandmarkID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00686540":{
        "tag":"(0068,6540)",
        "name":"Planning Landmark Description",
        "keyword":"PlanningLandmarkDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00686545":{
        "tag":"(0068,6545)",
        "name":"Planning Landmark Identification Code Sequence",
        "keyword":"PlanningLandmarkIdentificationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686550":{
        "tag":"(0068,6550)",
        "name":"2D Point Coordinates Sequence",
        "keyword":"TwoDPointCoordinatesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00686560":{
        "tag":"(0068,6560)",
        "name":"2D Point Coordinates",
        "keyword":"TwoDPointCoordinates",
        "vr":"FD",
        "vm":"2",
        "retired":false
    },
    "00686590":{
        "tag":"(0068,6590)",
        "name":"3D Point Coordinates",
        "keyword":"ThreeDPointCoordinates",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "006865A0":{
        "tag":"(0068,65A0)",
        "name":"2D Line Coordinates Sequence",
        "keyword":"TwoDLineCoordinatesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006865B0":{
        "tag":"(0068,65B0)",
        "name":"2D Line Coordinates",
        "keyword":"TwoDLineCoordinates",
        "vr":"FD",
        "vm":"4",
        "retired":false
    },
    "006865D0":{
        "tag":"(0068,65D0)",
        "name":"3D Line Coordinates",
        "keyword":"ThreeDLineCoordinates",
        "vr":"FD",
        "vm":"6",
        "retired":false
    },
    "006865E0":{
        "tag":"(0068,65E0)",
        "name":"2D Plane Coordinates Sequence",
        "keyword":"TwoDPlaneCoordinatesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "006865F0":{
        "tag":"(0068,65F0)",
        "name":"2D Plane Intersection",
        "keyword":"TwoDPlaneIntersection",
        "vr":"FD",
        "vm":"4",
        "retired":false
    },
    "00686610":{
        "tag":"(0068,6610)",
        "name":"3D Plane Origin",
        "keyword":"ThreeDPlaneOrigin",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00686620":{
        "tag":"(0068,6620)",
        "name":"3D Plane Normal",
        "keyword":"ThreeDPlaneNormal",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00700001":{
        "tag":"(0070,0001)",
        "name":"Graphic Annotation Sequence",
        "keyword":"GraphicAnnotationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700002":{
        "tag":"(0070,0002)",
        "name":"Graphic Layer",
        "keyword":"GraphicLayer",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700003":{
        "tag":"(0070,0003)",
        "name":"Bounding Box Annotation Units",
        "keyword":"BoundingBoxAnnotationUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700004":{
        "tag":"(0070,0004)",
        "name":"Anchor Point Annotation Units",
        "keyword":"AnchorPointAnnotationUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700005":{
        "tag":"(0070,0005)",
        "name":"Graphic Annotation Units",
        "keyword":"GraphicAnnotationUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700006":{
        "tag":"(0070,0006)",
        "name":"Unformatted Text Value",
        "keyword":"UnformattedTextValue",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00700008":{
        "tag":"(0070,0008)",
        "name":"Text Object Sequence",
        "keyword":"TextObjectSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700009":{
        "tag":"(0070,0009)",
        "name":"Graphic Object Sequence",
        "keyword":"GraphicObjectSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700010":{
        "tag":"(0070,0010)",
        "name":"Bounding Box Top Left Hand Corner",
        "keyword":"BoundingBoxTopLeftHandCorner",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00700011":{
        "tag":"(0070,0011)",
        "name":"Bounding Box Bottom Right Hand Corner",
        "keyword":"BoundingBoxBottomRightHandCorner",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00700012":{
        "tag":"(0070,0012)",
        "name":"Bounding Box Text Horizontal Justification",
        "keyword":"BoundingBoxTextHorizontalJustification",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700014":{
        "tag":"(0070,0014)",
        "name":"Anchor Point",
        "keyword":"AnchorPoint",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00700015":{
        "tag":"(0070,0015)",
        "name":"Anchor Point Visibility",
        "keyword":"AnchorPointVisibility",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700020":{
        "tag":"(0070,0020)",
        "name":"Graphic Dimensions",
        "keyword":"GraphicDimensions",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00700021":{
        "tag":"(0070,0021)",
        "name":"Number of Graphic Points",
        "keyword":"NumberOfGraphicPoints",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00700022":{
        "tag":"(0070,0022)",
        "name":"Graphic Data",
        "keyword":"GraphicData",
        "vr":"FL",
        "vm":"2-n",
        "retired":false
    },
    "00700023":{
        "tag":"(0070,0023)",
        "name":"Graphic Type",
        "keyword":"GraphicType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700024":{
        "tag":"(0070,0024)",
        "name":"Graphic Filled",
        "keyword":"GraphicFilled",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700040":{
        "tag":"(0070,0040)",
        "name":"Image Rotation (Retired)",
        "keyword":"ImageRotationRetired",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00700041":{
        "tag":"(0070,0041)",
        "name":"Image Horizontal Flip",
        "keyword":"ImageHorizontalFlip",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700042":{
        "tag":"(0070,0042)",
        "name":"Image Rotation",
        "keyword":"ImageRotation",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00700050":{
        "tag":"(0070,0050)",
        "name":"Displayed Area Top Left Hand Corner (Trial)",
        "keyword":"DisplayedAreaTopLeftHandCornerTrial",
        "vr":"US",
        "vm":"2",
        "retired":true
    },
    "00700051":{
        "tag":"(0070,0051)",
        "name":"Displayed Area Bottom Right Hand Corner (Trial)",
        "keyword":"DisplayedAreaBottomRightHandCornerTrial",
        "vr":"US",
        "vm":"2",
        "retired":true
    },
    "00700052":{
        "tag":"(0070,0052)",
        "name":"Displayed Area Top Left Hand Corner",
        "keyword":"DisplayedAreaTopLeftHandCorner",
        "vr":"SL",
        "vm":"2",
        "retired":false
    },
    "00700053":{
        "tag":"(0070,0053)",
        "name":"Displayed Area Bottom Right Hand Corner",
        "keyword":"DisplayedAreaBottomRightHandCorner",
        "vr":"SL",
        "vm":"2",
        "retired":false
    },
    "0070005A":{
        "tag":"(0070,005A)",
        "name":"Displayed Area Selection Sequence",
        "keyword":"DisplayedAreaSelectionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700060":{
        "tag":"(0070,0060)",
        "name":"Graphic Layer Sequence",
        "keyword":"GraphicLayerSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700062":{
        "tag":"(0070,0062)",
        "name":"Graphic Layer Order",
        "keyword":"GraphicLayerOrder",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00700066":{
        "tag":"(0070,0066)",
        "name":"Graphic Layer Recommended Display Grayscale Value",
        "keyword":"GraphicLayerRecommendedDisplayGrayscaleValue",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00700067":{
        "tag":"(0070,0067)",
        "name":"Graphic Layer Recommended Display RGB Value",
        "keyword":"GraphicLayerRecommendedDisplayRGBValue",
        "vr":"US",
        "vm":"3",
        "retired":true
    },
    "00700068":{
        "tag":"(0070,0068)",
        "name":"Graphic Layer Description",
        "keyword":"GraphicLayerDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00700080":{
        "tag":"(0070,0080)",
        "name":"Content Label",
        "keyword":"ContentLabel",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700081":{
        "tag":"(0070,0081)",
        "name":"Content Description",
        "keyword":"ContentDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00700082":{
        "tag":"(0070,0082)",
        "name":"Presentation Creation Date",
        "keyword":"PresentationCreationDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "00700083":{
        "tag":"(0070,0083)",
        "name":"Presentation Creation Time",
        "keyword":"PresentationCreationTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "00700084":{
        "tag":"(0070,0084)",
        "name":"Content Creator's Name",
        "keyword":"ContentCreatorName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "00700086":{
        "tag":"(0070,0086)",
        "name":"Content Creator's Identification Code Sequence",
        "keyword":"ContentCreatorIdentificationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700087":{
        "tag":"(0070,0087)",
        "name":"Alternate Content Description Sequence",
        "keyword":"AlternateContentDescriptionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700100":{
        "tag":"(0070,0100)",
        "name":"Presentation Size Mode",
        "keyword":"PresentationSizeMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700101":{
        "tag":"(0070,0101)",
        "name":"Presentation Pixel Spacing",
        "keyword":"PresentationPixelSpacing",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "00700102":{
        "tag":"(0070,0102)",
        "name":"Presentation Pixel Aspect Ratio",
        "keyword":"PresentationPixelAspectRatio",
        "vr":"IS",
        "vm":"2",
        "retired":false
    },
    "00700103":{
        "tag":"(0070,0103)",
        "name":"Presentation Pixel Magnification Ratio",
        "keyword":"PresentationPixelMagnificationRatio",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00700207":{
        "tag":"(0070,0207)",
        "name":"Graphic Group Label",
        "keyword":"GraphicGroupLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00700208":{
        "tag":"(0070,0208)",
        "name":"Graphic Group Description",
        "keyword":"GraphicGroupDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00700209":{
        "tag":"(0070,0209)",
        "name":"Compound Graphic Sequence",
        "keyword":"CompoundGraphicSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700226":{
        "tag":"(0070,0226)",
        "name":"Compound Graphic Instance ID",
        "keyword":"CompoundGraphicInstanceID",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00700227":{
        "tag":"(0070,0227)",
        "name":"Font Name",
        "keyword":"FontName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00700228":{
        "tag":"(0070,0228)",
        "name":"Font Name Type",
        "keyword":"FontNameType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700229":{
        "tag":"(0070,0229)",
        "name":"CSS Font Name",
        "keyword":"CSSFontName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00700230":{
        "tag":"(0070,0230)",
        "name":"Rotation Angle",
        "keyword":"RotationAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00700231":{
        "tag":"(0070,0231)",
        "name":"Text Style Sequence",
        "keyword":"TextStyleSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700232":{
        "tag":"(0070,0232)",
        "name":"Line Style Sequence",
        "keyword":"LineStyleSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700233":{
        "tag":"(0070,0233)",
        "name":"Fill Style Sequence",
        "keyword":"FillStyleSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700234":{
        "tag":"(0070,0234)",
        "name":"Graphic Group Sequence",
        "keyword":"GraphicGroupSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700241":{
        "tag":"(0070,0241)",
        "name":"Text Color CIELab Value",
        "keyword":"TextColorCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00700242":{
        "tag":"(0070,0242)",
        "name":"Horizontal Alignment",
        "keyword":"HorizontalAlignment",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700243":{
        "tag":"(0070,0243)",
        "name":"Vertical Alignment",
        "keyword":"VerticalAlignment",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700244":{
        "tag":"(0070,0244)",
        "name":"Shadow Style",
        "keyword":"ShadowStyle",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700245":{
        "tag":"(0070,0245)",
        "name":"Shadow Offset X",
        "keyword":"ShadowOffsetX",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00700246":{
        "tag":"(0070,0246)",
        "name":"Shadow Offset Y",
        "keyword":"ShadowOffsetY",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00700247":{
        "tag":"(0070,0247)",
        "name":"Shadow Color CIELab Value",
        "keyword":"ShadowColorCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00700248":{
        "tag":"(0070,0248)",
        "name":"Underlined",
        "keyword":"Underlined",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700249":{
        "tag":"(0070,0249)",
        "name":"Bold",
        "keyword":"Bold",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700250":{
        "tag":"(0070,0250)",
        "name":"Italic",
        "keyword":"Italic",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700251":{
        "tag":"(0070,0251)",
        "name":"Pattern On Color CIELab Value",
        "keyword":"PatternOnColorCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00700252":{
        "tag":"(0070,0252)",
        "name":"Pattern Off Color CIELab Value",
        "keyword":"PatternOffColorCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00700253":{
        "tag":"(0070,0253)",
        "name":"Line Thickness",
        "keyword":"LineThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00700254":{
        "tag":"(0070,0254)",
        "name":"Line Dashing Style",
        "keyword":"LineDashingStyle",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700255":{
        "tag":"(0070,0255)",
        "name":"Line Pattern",
        "keyword":"LinePattern",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00700256":{
        "tag":"(0070,0256)",
        "name":"Fill Pattern",
        "keyword":"FillPattern",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "00700257":{
        "tag":"(0070,0257)",
        "name":"Fill Mode",
        "keyword":"FillMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700258":{
        "tag":"(0070,0258)",
        "name":"Shadow Opacity",
        "keyword":"ShadowOpacity",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00700261":{
        "tag":"(0070,0261)",
        "name":"Gap Length",
        "keyword":"GapLength",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00700262":{
        "tag":"(0070,0262)",
        "name":"Diameter of Visibility",
        "keyword":"DiameterOfVisibility",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00700273":{
        "tag":"(0070,0273)",
        "name":"Rotation Point",
        "keyword":"RotationPoint",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "00700274":{
        "tag":"(0070,0274)",
        "name":"Tick Alignment",
        "keyword":"TickAlignment",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700278":{
        "tag":"(0070,0278)",
        "name":"Show Tick Label",
        "keyword":"ShowTickLabel",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700279":{
        "tag":"(0070,0279)",
        "name":"Tick Label Alignment",
        "keyword":"TickLabelAlignment",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700282":{
        "tag":"(0070,0282)",
        "name":"Compound Graphic Units",
        "keyword":"CompoundGraphicUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700284":{
        "tag":"(0070,0284)",
        "name":"Pattern On Opacity",
        "keyword":"PatternOnOpacity",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00700285":{
        "tag":"(0070,0285)",
        "name":"Pattern Off Opacity",
        "keyword":"PatternOffOpacity",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00700287":{
        "tag":"(0070,0287)",
        "name":"Major Ticks Sequence",
        "keyword":"MajorTicksSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700288":{
        "tag":"(0070,0288)",
        "name":"Tick Position",
        "keyword":"TickPosition",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00700289":{
        "tag":"(0070,0289)",
        "name":"Tick Label",
        "keyword":"TickLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00700294":{
        "tag":"(0070,0294)",
        "name":"Compound Graphic Type",
        "keyword":"CompoundGraphicType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700295":{
        "tag":"(0070,0295)",
        "name":"Graphic Group ID",
        "keyword":"GraphicGroupID",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00700306":{
        "tag":"(0070,0306)",
        "name":"Shape Type",
        "keyword":"ShapeType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00700308":{
        "tag":"(0070,0308)",
        "name":"Registration Sequence",
        "keyword":"RegistrationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700309":{
        "tag":"(0070,0309)",
        "name":"Matrix Registration Sequence",
        "keyword":"MatrixRegistrationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0070030A":{
        "tag":"(0070,030A)",
        "name":"Matrix Sequence",
        "keyword":"MatrixSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0070030B":{
        "tag":"(0070,030B)",
        "name":"Frame of Reference to Displayed Coordinate System Transformation Matrix",
        "keyword":"FrameOfReferenceToDisplayedCoordinateSystemTransformationMatrix",
        "vr":"FD",
        "vm":"16",
        "retired":false
    },
    "0070030C":{
        "tag":"(0070,030C)",
        "name":"Frame of Reference Transformation Matrix Type",
        "keyword":"FrameOfReferenceTransformationMatrixType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0070030D":{
        "tag":"(0070,030D)",
        "name":"Registration Type Code Sequence",
        "keyword":"RegistrationTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0070030F":{
        "tag":"(0070,030F)",
        "name":"Fiducial Description",
        "keyword":"FiducialDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00700310":{
        "tag":"(0070,0310)",
        "name":"Fiducial Identifier",
        "keyword":"FiducialIdentifier",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00700311":{
        "tag":"(0070,0311)",
        "name":"Fiducial Identifier Code Sequence",
        "keyword":"FiducialIdentifierCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700312":{
        "tag":"(0070,0312)",
        "name":"Contour Uncertainty Radius",
        "keyword":"ContourUncertaintyRadius",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00700314":{
        "tag":"(0070,0314)",
        "name":"Used Fiducials Sequence",
        "keyword":"UsedFiducialsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700318":{
        "tag":"(0070,0318)",
        "name":"Graphic Coordinates Data Sequence",
        "keyword":"GraphicCoordinatesDataSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0070031A":{
        "tag":"(0070,031A)",
        "name":"Fiducial UID",
        "keyword":"FiducialUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0070031C":{
        "tag":"(0070,031C)",
        "name":"Fiducial Set Sequence",
        "keyword":"FiducialSetSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0070031E":{
        "tag":"(0070,031E)",
        "name":"Fiducial Sequence",
        "keyword":"FiducialSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0070031F":{
        "tag":"(0070,031F)",
        "name":"Fiducials Property Category Code Sequence",
        "keyword":"FiducialsPropertyCategoryCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700401":{
        "tag":"(0070,0401)",
        "name":"Graphic Layer Recommended Display CIELab Value",
        "keyword":"GraphicLayerRecommendedDisplayCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00700402":{
        "tag":"(0070,0402)",
        "name":"Blending Sequence",
        "keyword":"BlendingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700403":{
        "tag":"(0070,0403)",
        "name":"Relative Opacity",
        "keyword":"RelativeOpacity",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "00700404":{
        "tag":"(0070,0404)",
        "name":"Referenced Spatial Registration Sequence",
        "keyword":"ReferencedSpatialRegistrationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00700405":{
        "tag":"(0070,0405)",
        "name":"Blending Position",
        "keyword":"BlendingPosition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701101":{
        "tag":"(0070,1101)",
        "name":"Presentation Display Collection UID",
        "keyword":"PresentationDisplayCollectionUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00701102":{
        "tag":"(0070,1102)",
        "name":"Presentation Sequence Collection UID",
        "keyword":"PresentationSequenceCollectionUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00701103":{
        "tag":"(0070,1103)",
        "name":"Presentation Sequence Position Index",
        "keyword":"PresentationSequencePositionIndex",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00701104":{
        "tag":"(0070,1104)",
        "name":"Rendered Image Reference Sequence",
        "keyword":"RenderedImageReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701201":{
        "tag":"(0070,1201)",
        "name":"Volumetric Presentation State Input Sequence",
        "keyword":"VolumetricPresentationStateInputSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701202":{
        "tag":"(0070,1202)",
        "name":"Presentation Input Type",
        "keyword":"PresentationInputType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701203":{
        "tag":"(0070,1203)",
        "name":"Input Sequence Position Index",
        "keyword":"InputSequencePositionIndex",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00701204":{
        "tag":"(0070,1204)",
        "name":"Crop",
        "keyword":"Crop",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701205":{
        "tag":"(0070,1205)",
        "name":"Cropping Specification Index",
        "keyword":"CroppingSpecificationIndex",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00701206":{
        "tag":"(0070,1206)",
        "name":"Compositing Method",
        "keyword":"CompositingMethod",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "00701207":{
        "tag":"(0070,1207)",
        "name":"Volumetric Presentation Input Number",
        "keyword":"VolumetricPresentationInputNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00701208":{
        "tag":"(0070,1208)",
        "name":"Image Volume Geometry",
        "keyword":"ImageVolumeGeometry",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701209":{
        "tag":"(0070,1209)",
        "name":"Volumetric Presentation Input Set UID",
        "keyword":"VolumetricPresentationInputSetUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "0070120A":{
        "tag":"(0070,120A)",
        "name":"Volumetric Presentation Input Set Sequence",
        "keyword":"VolumetricPresentationInputSetSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0070120B":{
        "tag":"(0070,120B)",
        "name":"Global Crop",
        "keyword":"GlobalCrop",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0070120C":{
        "tag":"(0070,120C)",
        "name":"Global Cropping Specification Index",
        "keyword":"GlobalCroppingSpecificationIndex",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "0070120D":{
        "tag":"(0070,120D)",
        "name":"Rendering Method",
        "keyword":"RenderingMethod",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701301":{
        "tag":"(0070,1301)",
        "name":"Volume Cropping Sequence",
        "keyword":"VolumeCroppingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701302":{
        "tag":"(0070,1302)",
        "name":"Volume Cropping Method",
        "keyword":"VolumeCroppingMethod",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701303":{
        "tag":"(0070,1303)",
        "name":"Bounding Box Crop",
        "keyword":"BoundingBoxCrop",
        "vr":"FD",
        "vm":"6",
        "retired":false
    },
    "00701304":{
        "tag":"(0070,1304)",
        "name":"Oblique Cropping Plane Sequence",
        "keyword":"ObliqueCroppingPlaneSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701305":{
        "tag":"(0070,1305)",
        "name":"Plane",
        "keyword":"Plane",
        "vr":"FD",
        "vm":"4",
        "retired":false
    },
    "00701306":{
        "tag":"(0070,1306)",
        "name":"Plane Normal",
        "keyword":"PlaneNormal",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00701309":{
        "tag":"(0070,1309)",
        "name":"Cropping Specification Number",
        "keyword":"CroppingSpecificationNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00701501":{
        "tag":"(0070,1501)",
        "name":"Multi-Planar Reconstruction Style",
        "keyword":"MultiPlanarReconstructionStyle",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701502":{
        "tag":"(0070,1502)",
        "name":"MPR Thickness Type",
        "keyword":"MPRThicknessType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701503":{
        "tag":"(0070,1503)",
        "name":"MPR Slab Thickness",
        "keyword":"MPRSlabThickness",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00701505":{
        "tag":"(0070,1505)",
        "name":"MPR Top Left Hand Corner",
        "keyword":"MPRTopLeftHandCorner",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00701507":{
        "tag":"(0070,1507)",
        "name":"MPR View Width Direction",
        "keyword":"MPRViewWidthDirection",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00701508":{
        "tag":"(0070,1508)",
        "name":"MPR View Width",
        "keyword":"MPRViewWidth",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0070150C":{
        "tag":"(0070,150C)",
        "name":"Number of Volumetric Curve Points",
        "keyword":"NumberOfVolumetricCurvePoints",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "0070150D":{
        "tag":"(0070,150D)",
        "name":"Volumetric Curve Points",
        "keyword":"VolumetricCurvePoints",
        "vr":"OD",
        "vm":"1",
        "retired":false
    },
    "00701511":{
        "tag":"(0070,1511)",
        "name":"MPR View Height Direction",
        "keyword":"MPRViewHeightDirection",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00701512":{
        "tag":"(0070,1512)",
        "name":"MPR View Height",
        "keyword":"MPRViewHeight",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00701602":{
        "tag":"(0070,1602)",
        "name":"Render Projection",
        "keyword":"RenderProjection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701603":{
        "tag":"(0070,1603)",
        "name":"Viewpoint Position",
        "keyword":"ViewpointPosition",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00701604":{
        "tag":"(0070,1604)",
        "name":"Viewpoint LookAt Point",
        "keyword":"ViewpointLookAtPoint",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00701605":{
        "tag":"(0070,1605)",
        "name":"Viewpoint Up Direction",
        "keyword":"ViewpointUpDirection",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00701606":{
        "tag":"(0070,1606)",
        "name":"Render Field of View",
        "keyword":"RenderFieldOfView",
        "vr":"FD",
        "vm":"6",
        "retired":false
    },
    "00701607":{
        "tag":"(0070,1607)",
        "name":"Sampling Step Size",
        "keyword":"SamplingStepSize",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00701701":{
        "tag":"(0070,1701)",
        "name":"Shading Style",
        "keyword":"ShadingStyle",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701702":{
        "tag":"(0070,1702)",
        "name":"Ambient Reflection Intensity",
        "keyword":"AmbientReflectionIntensity",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00701703":{
        "tag":"(0070,1703)",
        "name":"Light Direction",
        "keyword":"LightDirection",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00701704":{
        "tag":"(0070,1704)",
        "name":"Diffuse Reflection Intensity",
        "keyword":"DiffuseReflectionIntensity",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00701705":{
        "tag":"(0070,1705)",
        "name":"Specular Reflection Intensity",
        "keyword":"SpecularReflectionIntensity",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00701706":{
        "tag":"(0070,1706)",
        "name":"Shininess",
        "keyword":"Shininess",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00701801":{
        "tag":"(0070,1801)",
        "name":"Presentation State Classification Component Sequence",
        "keyword":"PresentationStateClassificationComponentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701802":{
        "tag":"(0070,1802)",
        "name":"Component Type",
        "keyword":"ComponentType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701803":{
        "tag":"(0070,1803)",
        "name":"Component Input Sequence",
        "keyword":"ComponentInputSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701804":{
        "tag":"(0070,1804)",
        "name":"Volumetric Presentation Input Index",
        "keyword":"VolumetricPresentationInputIndex",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00701805":{
        "tag":"(0070,1805)",
        "name":"Presentation State Compositor Component Sequence",
        "keyword":"PresentationStateCompositorComponentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701806":{
        "tag":"(0070,1806)",
        "name":"Weighting Transfer Function Sequence",
        "keyword":"WeightingTransferFunctionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701807":{
        "tag":"(0070,1807)",
        "name":"Weighting Lookup Table Descriptor",
        "keyword":"WeightingLookupTableDescriptor",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00701808":{
        "tag":"(0070,1808)",
        "name":"Weighting Lookup Table Data",
        "keyword":"WeightingLookupTableData",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "00701901":{
        "tag":"(0070,1901)",
        "name":"Volumetric Annotation Sequence",
        "keyword":"VolumetricAnnotationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701903":{
        "tag":"(0070,1903)",
        "name":"Referenced Structured Context Sequence",
        "keyword":"ReferencedStructuredContextSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701904":{
        "tag":"(0070,1904)",
        "name":"Referenced Content Item",
        "keyword":"ReferencedContentItem",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00701905":{
        "tag":"(0070,1905)",
        "name":"Volumetric Presentation Input Annotation Sequence",
        "keyword":"VolumetricPresentationInputAnnotationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701907":{
        "tag":"(0070,1907)",
        "name":"Annotation Clipping",
        "keyword":"AnnotationClipping",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701A01":{
        "tag":"(0070,1A01)",
        "name":"Presentation Animation Style",
        "keyword":"PresentationAnimationStyle",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701A03":{
        "tag":"(0070,1A03)",
        "name":"Recommended Animation Rate",
        "keyword":"RecommendedAnimationRate",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00701A04":{
        "tag":"(0070,1A04)",
        "name":"Animation Curve Sequence",
        "keyword":"AnimationCurveSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701A05":{
        "tag":"(0070,1A05)",
        "name":"Animation Step Size",
        "keyword":"AnimationStepSize",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00701A06":{
        "tag":"(0070,1A06)",
        "name":"Swivel Range",
        "keyword":"SwivelRange",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00701A07":{
        "tag":"(0070,1A07)",
        "name":"Volumetric Curve Up Directions",
        "keyword":"VolumetricCurveUpDirections",
        "vr":"OD",
        "vm":"1",
        "retired":false
    },
    "00701A08":{
        "tag":"(0070,1A08)",
        "name":"Volume Stream Sequence",
        "keyword":"VolumeStreamSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701A09":{
        "tag":"(0070,1A09)",
        "name":"RGBA Transfer Function Description",
        "keyword":"RGBATransferFunctionDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00701B01":{
        "tag":"(0070,1B01)",
        "name":"Advanced Blending Sequence",
        "keyword":"AdvancedBlendingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701B02":{
        "tag":"(0070,1B02)",
        "name":"Blending Input Number",
        "keyword":"BlendingInputNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00701B03":{
        "tag":"(0070,1B03)",
        "name":"Blending Display Input Sequence",
        "keyword":"BlendingDisplayInputSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701B04":{
        "tag":"(0070,1B04)",
        "name":"Blending Display Sequence",
        "keyword":"BlendingDisplaySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701B06":{
        "tag":"(0070,1B06)",
        "name":"Blending Mode",
        "keyword":"BlendingMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701B07":{
        "tag":"(0070,1B07)",
        "name":"Time Series Blending",
        "keyword":"TimeSeriesBlending",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701B08":{
        "tag":"(0070,1B08)",
        "name":"Geometry for Display",
        "keyword":"GeometryForDisplay",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701B11":{
        "tag":"(0070,1B11)",
        "name":"Threshold Sequence",
        "keyword":"ThresholdSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701B12":{
        "tag":"(0070,1B12)",
        "name":"Threshold Value Sequence",
        "keyword":"ThresholdValueSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00701B13":{
        "tag":"(0070,1B13)",
        "name":"Threshold Type",
        "keyword":"ThresholdType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00701B14":{
        "tag":"(0070,1B14)",
        "name":"Threshold Value",
        "keyword":"ThresholdValue",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00720002":{
        "tag":"(0072,0002)",
        "name":"Hanging Protocol Name",
        "keyword":"HangingProtocolName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00720004":{
        "tag":"(0072,0004)",
        "name":"Hanging Protocol Description",
        "keyword":"HangingProtocolDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00720006":{
        "tag":"(0072,0006)",
        "name":"Hanging Protocol Level",
        "keyword":"HangingProtocolLevel",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720008":{
        "tag":"(0072,0008)",
        "name":"Hanging Protocol Creator",
        "keyword":"HangingProtocolCreator",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0072000A":{
        "tag":"(0072,000A)",
        "name":"Hanging Protocol Creation DateTime",
        "keyword":"HangingProtocolCreationDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "0072000C":{
        "tag":"(0072,000C)",
        "name":"Hanging Protocol Definition Sequence",
        "keyword":"HangingProtocolDefinitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0072000E":{
        "tag":"(0072,000E)",
        "name":"Hanging Protocol User Identification Code Sequence",
        "keyword":"HangingProtocolUserIdentificationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720010":{
        "tag":"(0072,0010)",
        "name":"Hanging Protocol User Group Name",
        "keyword":"HangingProtocolUserGroupName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00720012":{
        "tag":"(0072,0012)",
        "name":"Source Hanging Protocol Sequence",
        "keyword":"SourceHangingProtocolSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720014":{
        "tag":"(0072,0014)",
        "name":"Number of Priors Referenced",
        "keyword":"NumberOfPriorsReferenced",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720020":{
        "tag":"(0072,0020)",
        "name":"Image Sets Sequence",
        "keyword":"ImageSetsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720022":{
        "tag":"(0072,0022)",
        "name":"Image Set Selector Sequence",
        "keyword":"ImageSetSelectorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720024":{
        "tag":"(0072,0024)",
        "name":"Image Set Selector Usage Flag",
        "keyword":"ImageSetSelectorUsageFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720026":{
        "tag":"(0072,0026)",
        "name":"Selector Attribute",
        "keyword":"SelectorAttribute",
        "vr":"AT",
        "vm":"1",
        "retired":false
    },
    "00720028":{
        "tag":"(0072,0028)",
        "name":"Selector Value Number",
        "keyword":"SelectorValueNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720030":{
        "tag":"(0072,0030)",
        "name":"Time Based Image Sets Sequence",
        "keyword":"TimeBasedImageSetsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720032":{
        "tag":"(0072,0032)",
        "name":"Image Set Number",
        "keyword":"ImageSetNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720034":{
        "tag":"(0072,0034)",
        "name":"Image Set Selector Category",
        "keyword":"ImageSetSelectorCategory",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720038":{
        "tag":"(0072,0038)",
        "name":"Relative Time",
        "keyword":"RelativeTime",
        "vr":"US",
        "vm":"2",
        "retired":false
    },
    "0072003A":{
        "tag":"(0072,003A)",
        "name":"Relative Time Units",
        "keyword":"RelativeTimeUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0072003C":{
        "tag":"(0072,003C)",
        "name":"Abstract Prior Value",
        "keyword":"AbstractPriorValue",
        "vr":"SS",
        "vm":"2",
        "retired":false
    },
    "0072003E":{
        "tag":"(0072,003E)",
        "name":"Abstract Prior Code Sequence",
        "keyword":"AbstractPriorCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720040":{
        "tag":"(0072,0040)",
        "name":"Image Set Label",
        "keyword":"ImageSetLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00720050":{
        "tag":"(0072,0050)",
        "name":"Selector Attribute VR",
        "keyword":"SelectorAttributeVR",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720052":{
        "tag":"(0072,0052)",
        "name":"Selector Sequence Pointer",
        "keyword":"SelectorSequencePointer",
        "vr":"AT",
        "vm":"1-n",
        "retired":false
    },
    "00720054":{
        "tag":"(0072,0054)",
        "name":"Selector Sequence Pointer Private Creator",
        "keyword":"SelectorSequencePointerPrivateCreator",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00720056":{
        "tag":"(0072,0056)",
        "name":"Selector Attribute Private Creator",
        "keyword":"SelectorAttributePrivateCreator",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0072005E":{
        "tag":"(0072,005E)",
        "name":"Selector AE Value",
        "keyword":"SelectorAEValue",
        "vr":"AE",
        "vm":"1-n",
        "retired":false
    },
    "0072005F":{
        "tag":"(0072,005F)",
        "name":"Selector AS Value",
        "keyword":"SelectorASValue",
        "vr":"AS",
        "vm":"1-n",
        "retired":false
    },
    "00720060":{
        "tag":"(0072,0060)",
        "name":"Selector AT Value",
        "keyword":"SelectorATValue",
        "vr":"AT",
        "vm":"1-n",
        "retired":false
    },
    "00720061":{
        "tag":"(0072,0061)",
        "name":"Selector DA Value",
        "keyword":"SelectorDAValue",
        "vr":"DA",
        "vm":"1-n",
        "retired":false
    },
    "00720062":{
        "tag":"(0072,0062)",
        "name":"Selector CS Value",
        "keyword":"SelectorCSValue",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00720063":{
        "tag":"(0072,0063)",
        "name":"Selector DT Value",
        "keyword":"SelectorDTValue",
        "vr":"DT",
        "vm":"1-n",
        "retired":false
    },
    "00720064":{
        "tag":"(0072,0064)",
        "name":"Selector IS Value",
        "keyword":"SelectorISValue",
        "vr":"IS",
        "vm":"1-n",
        "retired":false
    },
    "00720065":{
        "tag":"(0072,0065)",
        "name":"Selector OB Value",
        "keyword":"SelectorOBValue",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "00720066":{
        "tag":"(0072,0066)",
        "name":"Selector LO Value",
        "keyword":"SelectorLOValue",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "00720067":{
        "tag":"(0072,0067)",
        "name":"Selector OF Value",
        "keyword":"SelectorOFValue",
        "vr":"OF",
        "vm":"1",
        "retired":false
    },
    "00720068":{
        "tag":"(0072,0068)",
        "name":"Selector LT Value",
        "keyword":"SelectorLTValue",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00720069":{
        "tag":"(0072,0069)",
        "name":"Selector OW Value",
        "keyword":"SelectorOWValue",
        "vr":"OW",
        "vm":"1",
        "retired":false
    },
    "0072006A":{
        "tag":"(0072,006A)",
        "name":"Selector PN Value",
        "keyword":"SelectorPNValue",
        "vr":"PN",
        "vm":"1-n",
        "retired":false
    },
    "0072006B":{
        "tag":"(0072,006B)",
        "name":"Selector TM Value",
        "keyword":"SelectorTMValue",
        "vr":"TM",
        "vm":"1-n",
        "retired":false
    },
    "0072006C":{
        "tag":"(0072,006C)",
        "name":"Selector SH Value",
        "keyword":"SelectorSHValue",
        "vr":"SH",
        "vm":"1-n",
        "retired":false
    },
    "0072006D":{
        "tag":"(0072,006D)",
        "name":"Selector UN Value",
        "keyword":"SelectorUNValue",
        "vr":"UN",
        "vm":"1",
        "retired":false
    },
    "0072006E":{
        "tag":"(0072,006E)",
        "name":"Selector ST Value",
        "keyword":"SelectorSTValue",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "0072006F":{
        "tag":"(0072,006F)",
        "name":"Selector UC Value",
        "keyword":"SelectorUCValue",
        "vr":"UC",
        "vm":"1-n",
        "retired":false
    },
    "00720070":{
        "tag":"(0072,0070)",
        "name":"Selector UT Value",
        "keyword":"SelectorUTValue",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00720071":{
        "tag":"(0072,0071)",
        "name":"Selector UR Value",
        "keyword":"SelectorURValue",
        "vr":"UR",
        "vm":"1",
        "retired":false
    },
    "00720072":{
        "tag":"(0072,0072)",
        "name":"Selector DS Value",
        "keyword":"SelectorDSValue",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "00720073":{
        "tag":"(0072,0073)",
        "name":"Selector OD Value",
        "keyword":"SelectorODValue",
        "vr":"OD",
        "vm":"1",
        "retired":false
    },
    "00720074":{
        "tag":"(0072,0074)",
        "name":"Selector FD Value",
        "keyword":"SelectorFDValue",
        "vr":"FD",
        "vm":"1-n",
        "retired":false
    },
    "00720075":{
        "tag":"(0072,0075)",
        "name":"Selector OL Value",
        "keyword":"SelectorOLValue",
        "vr":"OL",
        "vm":"1",
        "retired":false
    },
    "00720076":{
        "tag":"(0072,0076)",
        "name":"Selector FL Value",
        "keyword":"SelectorFLValue",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "00720078":{
        "tag":"(0072,0078)",
        "name":"Selector UL Value",
        "keyword":"SelectorULValue",
        "vr":"UL",
        "vm":"1-n",
        "retired":false
    },
    "0072007A":{
        "tag":"(0072,007A)",
        "name":"Selector US Value",
        "keyword":"SelectorUSValue",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "0072007C":{
        "tag":"(0072,007C)",
        "name":"Selector SL Value",
        "keyword":"SelectorSLValue",
        "vr":"SL",
        "vm":"1-n",
        "retired":false
    },
    "0072007E":{
        "tag":"(0072,007E)",
        "name":"Selector SS Value",
        "keyword":"SelectorSSValue",
        "vr":"SS",
        "vm":"1-n",
        "retired":false
    },
    "0072007F":{
        "tag":"(0072,007F)",
        "name":"Selector UI Value",
        "keyword":"SelectorUIValue",
        "vr":"UI",
        "vm":"1-n",
        "retired":false
    },
    "00720080":{
        "tag":"(0072,0080)",
        "name":"Selector Code Sequence Value",
        "keyword":"SelectorCodeSequenceValue",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720100":{
        "tag":"(0072,0100)",
        "name":"Number of Screens",
        "keyword":"NumberOfScreens",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720102":{
        "tag":"(0072,0102)",
        "name":"Nominal Screen Definition Sequence",
        "keyword":"NominalScreenDefinitionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720104":{
        "tag":"(0072,0104)",
        "name":"Number of Vertical Pixels",
        "keyword":"NumberOfVerticalPixels",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720106":{
        "tag":"(0072,0106)",
        "name":"Number of Horizontal Pixels",
        "keyword":"NumberOfHorizontalPixels",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720108":{
        "tag":"(0072,0108)",
        "name":"Display Environment Spatial Position",
        "keyword":"DisplayEnvironmentSpatialPosition",
        "vr":"FD",
        "vm":"4",
        "retired":false
    },
    "0072010A":{
        "tag":"(0072,010A)",
        "name":"Screen Minimum Grayscale Bit Depth",
        "keyword":"ScreenMinimumGrayscaleBitDepth",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "0072010C":{
        "tag":"(0072,010C)",
        "name":"Screen Minimum Color Bit Depth",
        "keyword":"ScreenMinimumColorBitDepth",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "0072010E":{
        "tag":"(0072,010E)",
        "name":"Application Maximum Repaint Time",
        "keyword":"ApplicationMaximumRepaintTime",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720200":{
        "tag":"(0072,0200)",
        "name":"Display Sets Sequence",
        "keyword":"DisplaySetsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720202":{
        "tag":"(0072,0202)",
        "name":"Display Set Number",
        "keyword":"DisplaySetNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720203":{
        "tag":"(0072,0203)",
        "name":"Display Set Label",
        "keyword":"DisplaySetLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00720204":{
        "tag":"(0072,0204)",
        "name":"Display Set Presentation Group",
        "keyword":"DisplaySetPresentationGroup",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720206":{
        "tag":"(0072,0206)",
        "name":"Display Set Presentation Group Description",
        "keyword":"DisplaySetPresentationGroupDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00720208":{
        "tag":"(0072,0208)",
        "name":"Partial Data Display Handling",
        "keyword":"PartialDataDisplayHandling",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720210":{
        "tag":"(0072,0210)",
        "name":"Synchronized Scrolling Sequence",
        "keyword":"SynchronizedScrollingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720212":{
        "tag":"(0072,0212)",
        "name":"Display Set Scrolling Group",
        "keyword":"DisplaySetScrollingGroup",
        "vr":"US",
        "vm":"2-n",
        "retired":false
    },
    "00720214":{
        "tag":"(0072,0214)",
        "name":"Navigation Indicator Sequence",
        "keyword":"NavigationIndicatorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720216":{
        "tag":"(0072,0216)",
        "name":"Navigation Display Set",
        "keyword":"NavigationDisplaySet",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720218":{
        "tag":"(0072,0218)",
        "name":"Reference Display Sets",
        "keyword":"ReferenceDisplaySets",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00720300":{
        "tag":"(0072,0300)",
        "name":"Image Boxes Sequence",
        "keyword":"ImageBoxesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720302":{
        "tag":"(0072,0302)",
        "name":"Image Box Number",
        "keyword":"ImageBoxNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720304":{
        "tag":"(0072,0304)",
        "name":"Image Box Layout Type",
        "keyword":"ImageBoxLayoutType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720306":{
        "tag":"(0072,0306)",
        "name":"Image Box Tile Horizontal Dimension",
        "keyword":"ImageBoxTileHorizontalDimension",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720308":{
        "tag":"(0072,0308)",
        "name":"Image Box Tile Vertical Dimension",
        "keyword":"ImageBoxTileVerticalDimension",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720310":{
        "tag":"(0072,0310)",
        "name":"Image Box Scroll Direction",
        "keyword":"ImageBoxScrollDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720312":{
        "tag":"(0072,0312)",
        "name":"Image Box Small Scroll Type",
        "keyword":"ImageBoxSmallScrollType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720314":{
        "tag":"(0072,0314)",
        "name":"Image Box Small Scroll Amount",
        "keyword":"ImageBoxSmallScrollAmount",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720316":{
        "tag":"(0072,0316)",
        "name":"Image Box Large Scroll Type",
        "keyword":"ImageBoxLargeScrollType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720318":{
        "tag":"(0072,0318)",
        "name":"Image Box Large Scroll Amount",
        "keyword":"ImageBoxLargeScrollAmount",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720320":{
        "tag":"(0072,0320)",
        "name":"Image Box Overlap Priority",
        "keyword":"ImageBoxOverlapPriority",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00720330":{
        "tag":"(0072,0330)",
        "name":"Cine Relative to Real-Time",
        "keyword":"CineRelativeToRealTime",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00720400":{
        "tag":"(0072,0400)",
        "name":"Filter Operations Sequence",
        "keyword":"FilterOperationsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720402":{
        "tag":"(0072,0402)",
        "name":"Filter-by Category",
        "keyword":"FilterByCategory",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720404":{
        "tag":"(0072,0404)",
        "name":"Filter-by Attribute Presence",
        "keyword":"FilterByAttributePresence",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720406":{
        "tag":"(0072,0406)",
        "name":"Filter-by Operator",
        "keyword":"FilterByOperator",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720420":{
        "tag":"(0072,0420)",
        "name":"Structured Display Background CIELab Value",
        "keyword":"StructuredDisplayBackgroundCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00720421":{
        "tag":"(0072,0421)",
        "name":"Empty Image Box CIELab Value",
        "keyword":"EmptyImageBoxCIELabValue",
        "vr":"US",
        "vm":"3",
        "retired":false
    },
    "00720422":{
        "tag":"(0072,0422)",
        "name":"Structured Display Image Box Sequence",
        "keyword":"StructuredDisplayImageBoxSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720424":{
        "tag":"(0072,0424)",
        "name":"Structured Display Text Box Sequence",
        "keyword":"StructuredDisplayTextBoxSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720427":{
        "tag":"(0072,0427)",
        "name":"Referenced First Frame Sequence",
        "keyword":"ReferencedFirstFrameSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720430":{
        "tag":"(0072,0430)",
        "name":"Image Box Synchronization Sequence",
        "keyword":"ImageBoxSynchronizationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720432":{
        "tag":"(0072,0432)",
        "name":"Synchronized Image Box List",
        "keyword":"SynchronizedImageBoxList",
        "vr":"US",
        "vm":"2-n",
        "retired":false
    },
    "00720434":{
        "tag":"(0072,0434)",
        "name":"Type of Synchronization",
        "keyword":"TypeOfSynchronization",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720500":{
        "tag":"(0072,0500)",
        "name":"Blending Operation Type",
        "keyword":"BlendingOperationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720510":{
        "tag":"(0072,0510)",
        "name":"Reformatting Operation Type",
        "keyword":"ReformattingOperationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720512":{
        "tag":"(0072,0512)",
        "name":"Reformatting Thickness",
        "keyword":"ReformattingThickness",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00720514":{
        "tag":"(0072,0514)",
        "name":"Reformatting Interval",
        "keyword":"ReformattingInterval",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00720516":{
        "tag":"(0072,0516)",
        "name":"Reformatting Operation Initial View Direction",
        "keyword":"ReformattingOperationInitialViewDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720520":{
        "tag":"(0072,0520)",
        "name":"3D Rendering Type",
        "keyword":"ThreeDRenderingType",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "00720600":{
        "tag":"(0072,0600)",
        "name":"Sorting Operations Sequence",
        "keyword":"SortingOperationsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720602":{
        "tag":"(0072,0602)",
        "name":"Sort-by Category",
        "keyword":"SortByCategory",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720604":{
        "tag":"(0072,0604)",
        "name":"Sorting Direction",
        "keyword":"SortingDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720700":{
        "tag":"(0072,0700)",
        "name":"Display Set Patient Orientation",
        "keyword":"DisplaySetPatientOrientation",
        "vr":"CS",
        "vm":"2",
        "retired":false
    },
    "00720702":{
        "tag":"(0072,0702)",
        "name":"VOI Type",
        "keyword":"VOIType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720704":{
        "tag":"(0072,0704)",
        "name":"Pseudo-Color Type",
        "keyword":"PseudoColorType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720705":{
        "tag":"(0072,0705)",
        "name":"Pseudo-Color Palette Instance Reference Sequence",
        "keyword":"PseudoColorPaletteInstanceReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00720706":{
        "tag":"(0072,0706)",
        "name":"Show Grayscale Inverted",
        "keyword":"ShowGrayscaleInverted",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720710":{
        "tag":"(0072,0710)",
        "name":"Show Image True Size Flag",
        "keyword":"ShowImageTrueSizeFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720712":{
        "tag":"(0072,0712)",
        "name":"Show Graphic Annotation Flag",
        "keyword":"ShowGraphicAnnotationFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720714":{
        "tag":"(0072,0714)",
        "name":"Show Patient Demographics Flag",
        "keyword":"ShowPatientDemographicsFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720716":{
        "tag":"(0072,0716)",
        "name":"Show Acquisition Techniques Flag",
        "keyword":"ShowAcquisitionTechniquesFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720717":{
        "tag":"(0072,0717)",
        "name":"Display Set Horizontal Justification",
        "keyword":"DisplaySetHorizontalJustification",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00720718":{
        "tag":"(0072,0718)",
        "name":"Display Set Vertical Justification",
        "keyword":"DisplaySetVerticalJustification",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00740120":{
        "tag":"(0074,0120)",
        "name":"Continuation Start Meterset",
        "keyword":"ContinuationStartMeterset",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00740121":{
        "tag":"(0074,0121)",
        "name":"Continuation End Meterset",
        "keyword":"ContinuationEndMeterset",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00741000":{
        "tag":"(0074,1000)",
        "name":"Procedure Step State",
        "keyword":"ProcedureStepState",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00741002":{
        "tag":"(0074,1002)",
        "name":"Procedure Step Progress Information Sequence",
        "keyword":"ProcedureStepProgressInformationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741004":{
        "tag":"(0074,1004)",
        "name":"Procedure Step Progress",
        "keyword":"ProcedureStepProgress",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00741006":{
        "tag":"(0074,1006)",
        "name":"Procedure Step Progress Description",
        "keyword":"ProcedureStepProgressDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00741007":{
        "tag":"(0074,1007)",
        "name":"Procedure Step Progress Parameters Sequence",
        "keyword":"ProcedureStepProgressParametersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741008":{
        "tag":"(0074,1008)",
        "name":"Procedure Step Communications URI Sequence",
        "keyword":"ProcedureStepCommunicationsURISequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0074100A":{
        "tag":"(0074,100A)",
        "name":"Contact URI",
        "keyword":"ContactURI",
        "vr":"UR",
        "vm":"1",
        "retired":false
    },
    "0074100C":{
        "tag":"(0074,100C)",
        "name":"Contact Display Name",
        "keyword":"ContactDisplayName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0074100E":{
        "tag":"(0074,100E)",
        "name":"Procedure Step Discontinuation Reason Code Sequence",
        "keyword":"ProcedureStepDiscontinuationReasonCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741020":{
        "tag":"(0074,1020)",
        "name":"Beam Task Sequence",
        "keyword":"BeamTaskSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741022":{
        "tag":"(0074,1022)",
        "name":"Beam Task Type",
        "keyword":"BeamTaskType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00741024":{
        "tag":"(0074,1024)",
        "name":"Beam Order Index (Trial)",
        "keyword":"BeamOrderIndexTrial",
        "vr":"IS",
        "vm":"1",
        "retired":true
    },
    "00741025":{
        "tag":"(0074,1025)",
        "name":"Autosequence Flag",
        "keyword":"AutosequenceFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00741026":{
        "tag":"(0074,1026)",
        "name":"Table Top Vertical Adjusted Position",
        "keyword":"TableTopVerticalAdjustedPosition",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00741027":{
        "tag":"(0074,1027)",
        "name":"Table Top Longitudinal Adjusted Position",
        "keyword":"TableTopLongitudinalAdjustedPosition",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00741028":{
        "tag":"(0074,1028)",
        "name":"Table Top Lateral Adjusted Position",
        "keyword":"TableTopLateralAdjustedPosition",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0074102A":{
        "tag":"(0074,102A)",
        "name":"Patient Support Adjusted Angle",
        "keyword":"PatientSupportAdjustedAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0074102B":{
        "tag":"(0074,102B)",
        "name":"Table Top Eccentric Adjusted Angle",
        "keyword":"TableTopEccentricAdjustedAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0074102C":{
        "tag":"(0074,102C)",
        "name":"Table Top Pitch Adjusted Angle",
        "keyword":"TableTopPitchAdjustedAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0074102D":{
        "tag":"(0074,102D)",
        "name":"Table Top Roll Adjusted Angle",
        "keyword":"TableTopRollAdjustedAngle",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00741030":{
        "tag":"(0074,1030)",
        "name":"Delivery Verification Image Sequence",
        "keyword":"DeliveryVerificationImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741032":{
        "tag":"(0074,1032)",
        "name":"Verification Image Timing",
        "keyword":"VerificationImageTiming",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00741034":{
        "tag":"(0074,1034)",
        "name":"Double Exposure Flag",
        "keyword":"DoubleExposureFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00741036":{
        "tag":"(0074,1036)",
        "name":"Double Exposure Ordering",
        "keyword":"DoubleExposureOrdering",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00741038":{
        "tag":"(0074,1038)",
        "name":"Double Exposure Meterset (Trial)",
        "keyword":"DoubleExposureMetersetTrial",
        "vr":"DS",
        "vm":"1",
        "retired":true
    },
    "0074103A":{
        "tag":"(0074,103A)",
        "name":"Double Exposure Field Delta (Trial)",
        "keyword":"DoubleExposureFieldDeltaTrial",
        "vr":"DS",
        "vm":"4",
        "retired":true
    },
    "00741040":{
        "tag":"(0074,1040)",
        "name":"Related Reference RT Image Sequence",
        "keyword":"RelatedReferenceRTImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741042":{
        "tag":"(0074,1042)",
        "name":"General Machine Verification Sequence",
        "keyword":"GeneralMachineVerificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741044":{
        "tag":"(0074,1044)",
        "name":"Conventional Machine Verification Sequence",
        "keyword":"ConventionalMachineVerificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741046":{
        "tag":"(0074,1046)",
        "name":"Ion Machine Verification Sequence",
        "keyword":"IonMachineVerificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741048":{
        "tag":"(0074,1048)",
        "name":"Failed Attributes Sequence",
        "keyword":"FailedAttributesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0074104A":{
        "tag":"(0074,104A)",
        "name":"Overridden Attributes Sequence",
        "keyword":"OverriddenAttributesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0074104C":{
        "tag":"(0074,104C)",
        "name":"Conventional Control Point Verification Sequence",
        "keyword":"ConventionalControlPointVerificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0074104E":{
        "tag":"(0074,104E)",
        "name":"Ion Control Point Verification Sequence",
        "keyword":"IonControlPointVerificationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741050":{
        "tag":"(0074,1050)",
        "name":"Attribute Occurrence Sequence",
        "keyword":"AttributeOccurrenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741052":{
        "tag":"(0074,1052)",
        "name":"Attribute Occurrence Pointer",
        "keyword":"AttributeOccurrencePointer",
        "vr":"AT",
        "vm":"1",
        "retired":false
    },
    "00741054":{
        "tag":"(0074,1054)",
        "name":"Attribute Item Selector",
        "keyword":"AttributeItemSelector",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00741056":{
        "tag":"(0074,1056)",
        "name":"Attribute Occurrence Private Creator",
        "keyword":"AttributeOccurrencePrivateCreator",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00741057":{
        "tag":"(0074,1057)",
        "name":"Selector Sequence Pointer Items",
        "keyword":"SelectorSequencePointerItems",
        "vr":"IS",
        "vm":"1-n",
        "retired":false
    },
    "00741200":{
        "tag":"(0074,1200)",
        "name":"Scheduled Procedure Step Priority",
        "keyword":"ScheduledProcedureStepPriority",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00741202":{
        "tag":"(0074,1202)",
        "name":"Worklist Label",
        "keyword":"WorklistLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00741204":{
        "tag":"(0074,1204)",
        "name":"Procedure Step Label",
        "keyword":"ProcedureStepLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00741210":{
        "tag":"(0074,1210)",
        "name":"Scheduled Processing Parameters Sequence",
        "keyword":"ScheduledProcessingParametersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741212":{
        "tag":"(0074,1212)",
        "name":"Performed Processing Parameters Sequence",
        "keyword":"PerformedProcessingParametersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741216":{
        "tag":"(0074,1216)",
        "name":"Unified Procedure Step Performed Procedure Sequence",
        "keyword":"UnifiedProcedureStepPerformedProcedureSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741220":{
        "tag":"(0074,1220)",
        "name":"Related Procedure Step Sequence",
        "keyword":"RelatedProcedureStepSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "00741222":{
        "tag":"(0074,1222)",
        "name":"Procedure Step Relationship Type",
        "keyword":"ProcedureStepRelationshipType",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00741224":{
        "tag":"(0074,1224)",
        "name":"Replaced Procedure Step Sequence",
        "keyword":"ReplacedProcedureStepSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741230":{
        "tag":"(0074,1230)",
        "name":"Deletion Lock",
        "keyword":"DeletionLock",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00741234":{
        "tag":"(0074,1234)",
        "name":"Receiving AE",
        "keyword":"ReceivingAE",
        "vr":"AE",
        "vm":"1",
        "retired":false
    },
    "00741236":{
        "tag":"(0074,1236)",
        "name":"Requesting AE",
        "keyword":"RequestingAE",
        "vr":"AE",
        "vm":"1",
        "retired":false
    },
    "00741238":{
        "tag":"(0074,1238)",
        "name":"Reason for Cancellation",
        "keyword":"ReasonForCancellation",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "00741242":{
        "tag":"(0074,1242)",
        "name":"SCP Status",
        "keyword":"SCPStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00741244":{
        "tag":"(0074,1244)",
        "name":"Subscription List Status",
        "keyword":"SubscriptionListStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00741246":{
        "tag":"(0074,1246)",
        "name":"Unified Procedure Step List Status",
        "keyword":"UnifiedProcedureStepListStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00741324":{
        "tag":"(0074,1324)",
        "name":"Beam Order Index",
        "keyword":"BeamOrderIndex",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00741338":{
        "tag":"(0074,1338)",
        "name":"Double Exposure Meterset",
        "keyword":"DoubleExposureMeterset",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "0074133A":{
        "tag":"(0074,133A)",
        "name":"Double Exposure Field Delta",
        "keyword":"DoubleExposureFieldDelta",
        "vr":"FD",
        "vm":"4",
        "retired":false
    },
    "00741401":{
        "tag":"(0074,1401)",
        "name":"Brachy Task Sequence",
        "keyword":"BrachyTaskSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741402":{
        "tag":"(0074,1402)",
        "name":"Continuation Start Total Reference Air Kerma",
        "keyword":"ContinuationStartTotalReferenceAirKerma",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00741403":{
        "tag":"(0074,1403)",
        "name":"Continuation End Total Reference Air Kerma",
        "keyword":"ContinuationEndTotalReferenceAirKerma",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00741404":{
        "tag":"(0074,1404)",
        "name":"Continuation Pulse Number",
        "keyword":"ContinuationPulseNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00741405":{
        "tag":"(0074,1405)",
        "name":"Channel Delivery Order Sequence",
        "keyword":"ChannelDeliveryOrderSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00741406":{
        "tag":"(0074,1406)",
        "name":"Referenced Channel Number",
        "keyword":"ReferencedChannelNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "00741407":{
        "tag":"(0074,1407)",
        "name":"Start Cumulative Time Weight",
        "keyword":"StartCumulativeTimeWeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00741408":{
        "tag":"(0074,1408)",
        "name":"End Cumulative Time Weight",
        "keyword":"EndCumulativeTimeWeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "00741409":{
        "tag":"(0074,1409)",
        "name":"Omitted Channel Sequence",
        "keyword":"OmittedChannelSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0074140A":{
        "tag":"(0074,140A)",
        "name":"Reason for Channel Omission",
        "keyword":"ReasonForChannelOmission",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0074140B":{
        "tag":"(0074,140B)",
        "name":"Reason for Channel Omission Description",
        "keyword":"ReasonForChannelOmissionDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "0074140C":{
        "tag":"(0074,140C)",
        "name":"Channel Delivery Order Index",
        "keyword":"ChannelDeliveryOrderIndex",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "0074140D":{
        "tag":"(0074,140D)",
        "name":"Channel Delivery Continuation Sequence",
        "keyword":"ChannelDeliveryContinuationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0074140E":{
        "tag":"(0074,140E)",
        "name":"Omitted Application Setup Sequence",
        "keyword":"OmittedApplicationSetupSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00760001":{
        "tag":"(0076,0001)",
        "name":"Implant Assembly Template Name",
        "keyword":"ImplantAssemblyTemplateName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00760003":{
        "tag":"(0076,0003)",
        "name":"Implant Assembly Template Issuer",
        "keyword":"ImplantAssemblyTemplateIssuer",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00760006":{
        "tag":"(0076,0006)",
        "name":"Implant Assembly Template Version",
        "keyword":"ImplantAssemblyTemplateVersion",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00760008":{
        "tag":"(0076,0008)",
        "name":"Replaced Implant Assembly Template Sequence",
        "keyword":"ReplacedImplantAssemblyTemplateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0076000A":{
        "tag":"(0076,000A)",
        "name":"Implant Assembly Template Type",
        "keyword":"ImplantAssemblyTemplateType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0076000C":{
        "tag":"(0076,000C)",
        "name":"Original Implant Assembly Template Sequence",
        "keyword":"OriginalImplantAssemblyTemplateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0076000E":{
        "tag":"(0076,000E)",
        "name":"Derivation Implant Assembly Template Sequence",
        "keyword":"DerivationImplantAssemblyTemplateSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00760010":{
        "tag":"(0076,0010)",
        "name":"Implant Assembly Template Target Anatomy Sequence",
        "keyword":"ImplantAssemblyTemplateTargetAnatomySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00760020":{
        "tag":"(0076,0020)",
        "name":"Procedure Type Code Sequence",
        "keyword":"ProcedureTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00760030":{
        "tag":"(0076,0030)",
        "name":"Surgical Technique",
        "keyword":"SurgicalTechnique",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00760032":{
        "tag":"(0076,0032)",
        "name":"Component Types Sequence",
        "keyword":"ComponentTypesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00760034":{
        "tag":"(0076,0034)",
        "name":"Component Type Code Sequence",
        "keyword":"ComponentTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00760036":{
        "tag":"(0076,0036)",
        "name":"Exclusive Component Type",
        "keyword":"ExclusiveComponentType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00760038":{
        "tag":"(0076,0038)",
        "name":"Mandatory Component Type",
        "keyword":"MandatoryComponentType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00760040":{
        "tag":"(0076,0040)",
        "name":"Component Sequence",
        "keyword":"ComponentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00760055":{
        "tag":"(0076,0055)",
        "name":"Component ID",
        "keyword":"ComponentID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00760060":{
        "tag":"(0076,0060)",
        "name":"Component Assembly Sequence",
        "keyword":"ComponentAssemblySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00760070":{
        "tag":"(0076,0070)",
        "name":"Component 1 Referenced ID",
        "keyword":"Component1ReferencedID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00760080":{
        "tag":"(0076,0080)",
        "name":"Component 1 Referenced Mating Feature Set ID",
        "keyword":"Component1ReferencedMatingFeatureSetID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00760090":{
        "tag":"(0076,0090)",
        "name":"Component 1 Referenced Mating Feature ID",
        "keyword":"Component1ReferencedMatingFeatureID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "007600A0":{
        "tag":"(0076,00A0)",
        "name":"Component 2 Referenced ID",
        "keyword":"Component2ReferencedID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "007600B0":{
        "tag":"(0076,00B0)",
        "name":"Component 2 Referenced Mating Feature Set ID",
        "keyword":"Component2ReferencedMatingFeatureSetID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "007600C0":{
        "tag":"(0076,00C0)",
        "name":"Component 2 Referenced Mating Feature ID",
        "keyword":"Component2ReferencedMatingFeatureID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00780001":{
        "tag":"(0078,0001)",
        "name":"Implant Template Group Name",
        "keyword":"ImplantTemplateGroupName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00780010":{
        "tag":"(0078,0010)",
        "name":"Implant Template Group Description",
        "keyword":"ImplantTemplateGroupDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "00780020":{
        "tag":"(0078,0020)",
        "name":"Implant Template Group Issuer",
        "keyword":"ImplantTemplateGroupIssuer",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00780024":{
        "tag":"(0078,0024)",
        "name":"Implant Template Group Version",
        "keyword":"ImplantTemplateGroupVersion",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00780026":{
        "tag":"(0078,0026)",
        "name":"Replaced Implant Template Group Sequence",
        "keyword":"ReplacedImplantTemplateGroupSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00780028":{
        "tag":"(0078,0028)",
        "name":"Implant Template Group Target Anatomy Sequence",
        "keyword":"ImplantTemplateGroupTargetAnatomySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0078002A":{
        "tag":"(0078,002A)",
        "name":"Implant Template Group Members Sequence",
        "keyword":"ImplantTemplateGroupMembersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "0078002E":{
        "tag":"(0078,002E)",
        "name":"Implant Template Group Member ID",
        "keyword":"ImplantTemplateGroupMemberID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00780050":{
        "tag":"(0078,0050)",
        "name":"3D Implant Template Group Member Matching Point",
        "keyword":"ThreeDImplantTemplateGroupMemberMatchingPoint",
        "vr":"FD",
        "vm":"3",
        "retired":false
    },
    "00780060":{
        "tag":"(0078,0060)",
        "name":"3D Implant Template Group Member Matching Axes",
        "keyword":"ThreeDImplantTemplateGroupMemberMatchingAxes",
        "vr":"FD",
        "vm":"9",
        "retired":false
    },
    "00780070":{
        "tag":"(0078,0070)",
        "name":"Implant Template Group Member Matching 2D Coordinates Sequence",
        "keyword":"ImplantTemplateGroupMemberMatching2DCoordinatesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00780090":{
        "tag":"(0078,0090)",
        "name":"2D Implant Template Group Member Matching Point",
        "keyword":"TwoDImplantTemplateGroupMemberMatchingPoint",
        "vr":"FD",
        "vm":"2",
        "retired":false
    },
    "007800A0":{
        "tag":"(0078,00A0)",
        "name":"2D Implant Template Group Member Matching Axes",
        "keyword":"TwoDImplantTemplateGroupMemberMatchingAxes",
        "vr":"FD",
        "vm":"4",
        "retired":false
    },
    "007800B0":{
        "tag":"(0078,00B0)",
        "name":"Implant Template Group Variation Dimension Sequence",
        "keyword":"ImplantTemplateGroupVariationDimensionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "007800B2":{
        "tag":"(0078,00B2)",
        "name":"Implant Template Group Variation Dimension Name",
        "keyword":"ImplantTemplateGroupVariationDimensionName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "007800B4":{
        "tag":"(0078,00B4)",
        "name":"Implant Template Group Variation Dimension Rank Sequence",
        "keyword":"ImplantTemplateGroupVariationDimensionRankSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "007800B6":{
        "tag":"(0078,00B6)",
        "name":"Referenced Implant Template Group Member ID",
        "keyword":"ReferencedImplantTemplateGroupMemberID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "007800B8":{
        "tag":"(0078,00B8)",
        "name":"Implant Template Group Variation Dimension Rank",
        "keyword":"ImplantTemplateGroupVariationDimensionRank",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "00800001":{
        "tag":"(0080,0001)",
        "name":"Surface Scan Acquisition Type Code Sequence",
        "keyword":"SurfaceScanAcquisitionTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00800002":{
        "tag":"(0080,0002)",
        "name":"Surface Scan Mode Code Sequence",
        "keyword":"SurfaceScanModeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00800003":{
        "tag":"(0080,0003)",
        "name":"Registration Method Code Sequence",
        "keyword":"RegistrationMethodCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00800004":{
        "tag":"(0080,0004)",
        "name":"Shot Duration Time",
        "keyword":"ShotDurationTime",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00800005":{
        "tag":"(0080,0005)",
        "name":"Shot Offset Time",
        "keyword":"ShotOffsetTime",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "00800006":{
        "tag":"(0080,0006)",
        "name":"Surface Point Presentation Value Data",
        "keyword":"SurfacePointPresentationValueData",
        "vr":"US",
        "vm":"1-n",
        "retired":false
    },
    "00800007":{
        "tag":"(0080,0007)",
        "name":"Surface Point Color CIELab Value Data",
        "keyword":"SurfacePointColorCIELabValueData",
        "vr":"US",
        "vm":"3-3n",
        "retired":false
    },
    "00800008":{
        "tag":"(0080,0008)",
        "name":"UV Mapping Sequence",
        "keyword":"UVMappingSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00800009":{
        "tag":"(0080,0009)",
        "name":"Texture Label",
        "keyword":"TextureLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00800010":{
        "tag":"(0080,0010)",
        "name":"U Value Data",
        "keyword":"UValueData",
        "vr":"OF",
        "vm":"1-n",
        "retired":false
    },
    "00800011":{
        "tag":"(0080,0011)",
        "name":"V Value Data",
        "keyword":"VValueData",
        "vr":"OF",
        "vm":"1-n",
        "retired":false
    },
    "00800012":{
        "tag":"(0080,0012)",
        "name":"Referenced Texture Sequence",
        "keyword":"ReferencedTextureSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00800013":{
        "tag":"(0080,0013)",
        "name":"Referenced Surface Data Sequence",
        "keyword":"ReferencedSurfaceDataSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00820001":{
        "tag":"(0082,0001)",
        "name":"Assessment Summary",
        "keyword":"AssessmentSummary",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00820003":{
        "tag":"(0082,0003)",
        "name":"Assessment Summary Description",
        "keyword":"AssessmentSummaryDescription",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00820004":{
        "tag":"(0082,0004)",
        "name":"Assessed SOP Instance Sequence",
        "keyword":"AssessedSOPInstanceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00820005":{
        "tag":"(0082,0005)",
        "name":"Referenced Comparison SOP Instance Sequence",
        "keyword":"ReferencedComparisonSOPInstanceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00820006":{
        "tag":"(0082,0006)",
        "name":"Number of Assessment Observations",
        "keyword":"NumberOfAssessmentObservations",
        "vr":"UL",
        "vm":"1",
        "retired":false
    },
    "00820007":{
        "tag":"(0082,0007)",
        "name":"Assessment Observations Sequence",
        "keyword":"AssessmentObservationsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00820008":{
        "tag":"(0082,0008)",
        "name":"Observation Significance",
        "keyword":"ObservationSignificance",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "0082000A":{
        "tag":"(0082,000A)",
        "name":"Observation Description",
        "keyword":"ObservationDescription",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "0082000C":{
        "tag":"(0082,000C)",
        "name":"Structured Constraint Observation Sequence",
        "keyword":"StructuredConstraintObservationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00820010":{
        "tag":"(0082,0010)",
        "name":"Assessed Attribute Value Sequence",
        "keyword":"AssessedAttributeValueSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00820016":{
        "tag":"(0082,0016)",
        "name":"Assessment Set ID",
        "keyword":"AssessmentSetID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00820017":{
        "tag":"(0082,0017)",
        "name":"Assessment Requester Sequence",
        "keyword":"AssessmentRequesterSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00820018":{
        "tag":"(0082,0018)",
        "name":"Selector Attribute Name",
        "keyword":"SelectorAttributeName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00820019":{
        "tag":"(0082,0019)",
        "name":"Selector Attribute Keyword",
        "keyword":"SelectorAttributeKeyword",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00820021":{
        "tag":"(0082,0021)",
        "name":"Assessment Type Code Sequence",
        "keyword":"AssessmentTypeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00820022":{
        "tag":"(0082,0022)",
        "name":"Observation Basis Code Sequence",
        "keyword":"ObservationBasisCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00820023":{
        "tag":"(0082,0023)",
        "name":"Assessment Label",
        "keyword":"AssessmentLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "00820032":{
        "tag":"(0082,0032)",
        "name":"Constraint Type",
        "keyword":"ConstraintType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00820033":{
        "tag":"(0082,0033)",
        "name":"Specification Selection Guidance",
        "keyword":"SpecificationSelectionGuidance",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00820034":{
        "tag":"(0082,0034)",
        "name":"Constraint Value Sequence",
        "keyword":"ConstraintValueSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00820035":{
        "tag":"(0082,0035)",
        "name":"Recommended Default Value Sequence",
        "keyword":"RecommendedDefaultValueSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00820036":{
        "tag":"(0082,0036)",
        "name":"Constraint Violation Significance",
        "keyword":"ConstraintViolationSignificance",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00820037":{
        "tag":"(0082,0037)",
        "name":"Constraint Violation Condition",
        "keyword":"ConstraintViolationCondition",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "00820038":{
        "tag":"(0082,0038)",
        "name":"Modifiable Constraint Flag",
        "keyword":"ModifiableConstraintFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "00880130":{
        "tag":"(0088,0130)",
        "name":"Storage Media File-set ID",
        "keyword":"StorageMediaFileSetID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "00880140":{
        "tag":"(0088,0140)",
        "name":"Storage Media File-set UID",
        "keyword":"StorageMediaFileSetUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "00880200":{
        "tag":"(0088,0200)",
        "name":"Icon Image Sequence",
        "keyword":"IconImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "00880904":{
        "tag":"(0088,0904)",
        "name":"Topic Title",
        "keyword":"TopicTitle",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00880906":{
        "tag":"(0088,0906)",
        "name":"Topic Subject",
        "keyword":"TopicSubject",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "00880910":{
        "tag":"(0088,0910)",
        "name":"Topic Author",
        "keyword":"TopicAuthor",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "00880912":{
        "tag":"(0088,0912)",
        "name":"Topic Keywords",
        "keyword":"TopicKeywords",
        "vr":"LO",
        "vm":"1-32",
        "retired":true
    },
    "01000410":{
        "tag":"(0100,0410)",
        "name":"SOP Instance Status",
        "keyword":"SOPInstanceStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "01000420":{
        "tag":"(0100,0420)",
        "name":"SOP Authorization DateTime",
        "keyword":"SOPAuthorizationDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "01000424":{
        "tag":"(0100,0424)",
        "name":"SOP Authorization Comment",
        "keyword":"SOPAuthorizationComment",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "01000426":{
        "tag":"(0100,0426)",
        "name":"Authorization Equipment Certification Number",
        "keyword":"AuthorizationEquipmentCertificationNumber",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "04000005":{
        "tag":"(0400,0005)",
        "name":"MAC ID Number",
        "keyword":"MACIDNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "04000010":{
        "tag":"(0400,0010)",
        "name":"MAC Calculation Transfer Syntax UID",
        "keyword":"MACCalculationTransferSyntaxUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "04000015":{
        "tag":"(0400,0015)",
        "name":"MAC Algorithm",
        "keyword":"MACAlgorithm",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "04000020":{
        "tag":"(0400,0020)",
        "name":"Data Elements Signed",
        "keyword":"DataElementsSigned",
        "vr":"AT",
        "vm":"1-n",
        "retired":false
    },
    "04000100":{
        "tag":"(0400,0100)",
        "name":"Digital Signature UID",
        "keyword":"DigitalSignatureUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "04000105":{
        "tag":"(0400,0105)",
        "name":"Digital Signature DateTime",
        "keyword":"DigitalSignatureDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "04000110":{
        "tag":"(0400,0110)",
        "name":"Certificate Type",
        "keyword":"CertificateType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "04000115":{
        "tag":"(0400,0115)",
        "name":"Certificate of Signer",
        "keyword":"CertificateOfSigner",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "04000120":{
        "tag":"(0400,0120)",
        "name":"Signature",
        "keyword":"Signature",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "04000305":{
        "tag":"(0400,0305)",
        "name":"Certified Timestamp Type",
        "keyword":"CertifiedTimestampType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "04000310":{
        "tag":"(0400,0310)",
        "name":"Certified Timestamp",
        "keyword":"CertifiedTimestamp",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "04000315":{
        "tag":"(0400,0315)",
        "name":"",
        "keyword":"",
        "vr":"FL",
        "vm":"1",
        "retired":true
    },
    "04000401":{
        "tag":"(0400,0401)",
        "name":"Digital Signature Purpose Code Sequence",
        "keyword":"DigitalSignaturePurposeCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "04000402":{
        "tag":"(0400,0402)",
        "name":"Referenced Digital Signature Sequence",
        "keyword":"ReferencedDigitalSignatureSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "04000403":{
        "tag":"(0400,0403)",
        "name":"Referenced SOP Instance MAC Sequence",
        "keyword":"ReferencedSOPInstanceMACSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "04000404":{
        "tag":"(0400,0404)",
        "name":"MAC",
        "keyword":"MAC",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "04000500":{
        "tag":"(0400,0500)",
        "name":"Encrypted Attributes Sequence",
        "keyword":"EncryptedAttributesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "04000510":{
        "tag":"(0400,0510)",
        "name":"Encrypted Content Transfer Syntax UID",
        "keyword":"EncryptedContentTransferSyntaxUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "04000520":{
        "tag":"(0400,0520)",
        "name":"Encrypted Content",
        "keyword":"EncryptedContent",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "04000550":{
        "tag":"(0400,0550)",
        "name":"Modified Attributes Sequence",
        "keyword":"ModifiedAttributesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "04000561":{
        "tag":"(0400,0561)",
        "name":"Original Attributes Sequence",
        "keyword":"OriginalAttributesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "04000562":{
        "tag":"(0400,0562)",
        "name":"Attribute Modification DateTime",
        "keyword":"AttributeModificationDateTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "04000563":{
        "tag":"(0400,0563)",
        "name":"Modifying System",
        "keyword":"ModifyingSystem",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "04000564":{
        "tag":"(0400,0564)",
        "name":"Source of Previous Values",
        "keyword":"SourceOfPreviousValues",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "04000565":{
        "tag":"(0400,0565)",
        "name":"Reason for the Attribute Modification",
        "keyword":"ReasonForTheAttributeModification",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "1000XXX0":{
        "tag":"(1000,XXX0)",
        "name":"Escape Triplet",
        "keyword":"EscapeTriplet",
        "vr":"US",
        "vm":"3",
        "retired":true
    },
    "1000XXX1":{
        "tag":"(1000,XXX1)",
        "name":"Run Length Triplet",
        "keyword":"RunLengthTriplet",
        "vr":"US",
        "vm":"3",
        "retired":true
    },
    "1000XXX2":{
        "tag":"(1000,XXX2)",
        "name":"Huffman Table Size",
        "keyword":"HuffmanTableSize",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "1000XXX3":{
        "tag":"(1000,XXX3)",
        "name":"Huffman Table Triplet",
        "keyword":"HuffmanTableTriplet",
        "vr":"US",
        "vm":"3",
        "retired":true
    },
    "1000XXX4":{
        "tag":"(1000,XXX4)",
        "name":"Shift Table Size",
        "keyword":"ShiftTableSize",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "1000XXX5":{
        "tag":"(1000,XXX5)",
        "name":"Shift Table Triplet",
        "keyword":"ShiftTableTriplet",
        "vr":"US",
        "vm":"3",
        "retired":true
    },
    "1010XXXX":{
        "tag":"(1010,XXXX)",
        "name":"Zonal Map",
        "keyword":"ZonalMap",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "20000010":{
        "tag":"(2000,0010)",
        "name":"Number of Copies",
        "keyword":"NumberOfCopies",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "2000001E":{
        "tag":"(2000,001E)",
        "name":"Printer Configuration Sequence",
        "keyword":"PrinterConfigurationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "20000020":{
        "tag":"(2000,0020)",
        "name":"Print Priority",
        "keyword":"PrintPriority",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20000030":{
        "tag":"(2000,0030)",
        "name":"Medium Type",
        "keyword":"MediumType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20000040":{
        "tag":"(2000,0040)",
        "name":"Film Destination",
        "keyword":"FilmDestination",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20000050":{
        "tag":"(2000,0050)",
        "name":"Film Session Label",
        "keyword":"FilmSessionLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "20000060":{
        "tag":"(2000,0060)",
        "name":"Memory Allocation",
        "keyword":"MemoryAllocation",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "20000061":{
        "tag":"(2000,0061)",
        "name":"Maximum Memory Allocation",
        "keyword":"MaximumMemoryAllocation",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "20000062":{
        "tag":"(2000,0062)",
        "name":"Color Image Printing Flag",
        "keyword":"ColorImagePrintingFlag",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "20000063":{
        "tag":"(2000,0063)",
        "name":"Collation Flag",
        "keyword":"CollationFlag",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "20000065":{
        "tag":"(2000,0065)",
        "name":"Annotation Flag",
        "keyword":"AnnotationFlag",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "20000067":{
        "tag":"(2000,0067)",
        "name":"Image Overlay Flag",
        "keyword":"ImageOverlayFlag",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "20000069":{
        "tag":"(2000,0069)",
        "name":"Presentation LUT Flag",
        "keyword":"PresentationLUTFlag",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "2000006A":{
        "tag":"(2000,006A)",
        "name":"Image Box Presentation LUT Flag",
        "keyword":"ImageBoxPresentationLUTFlag",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "200000A0":{
        "tag":"(2000,00A0)",
        "name":"Memory Bit Depth",
        "keyword":"MemoryBitDepth",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "200000A1":{
        "tag":"(2000,00A1)",
        "name":"Printing Bit Depth",
        "keyword":"PrintingBitDepth",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "200000A2":{
        "tag":"(2000,00A2)",
        "name":"Media Installed Sequence",
        "keyword":"MediaInstalledSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "200000A4":{
        "tag":"(2000,00A4)",
        "name":"Other Media Available Sequence",
        "keyword":"OtherMediaAvailableSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "200000A8":{
        "tag":"(2000,00A8)",
        "name":"Supported Image Display Formats Sequence",
        "keyword":"SupportedImageDisplayFormatsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "20000500":{
        "tag":"(2000,0500)",
        "name":"Referenced Film Box Sequence",
        "keyword":"ReferencedFilmBoxSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "20000510":{
        "tag":"(2000,0510)",
        "name":"Referenced Stored Print Sequence",
        "keyword":"ReferencedStoredPrintSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "20100010":{
        "tag":"(2010,0010)",
        "name":"Image Display Format",
        "keyword":"ImageDisplayFormat",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "20100030":{
        "tag":"(2010,0030)",
        "name":"Annotation Display Format ID",
        "keyword":"AnnotationDisplayFormatID",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20100040":{
        "tag":"(2010,0040)",
        "name":"Film Orientation",
        "keyword":"FilmOrientation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20100050":{
        "tag":"(2010,0050)",
        "name":"Film Size ID",
        "keyword":"FilmSizeID",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20100052":{
        "tag":"(2010,0052)",
        "name":"Printer Resolution ID",
        "keyword":"PrinterResolutionID",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20100054":{
        "tag":"(2010,0054)",
        "name":"Default Printer Resolution ID",
        "keyword":"DefaultPrinterResolutionID",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20100060":{
        "tag":"(2010,0060)",
        "name":"Magnification Type",
        "keyword":"MagnificationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20100080":{
        "tag":"(2010,0080)",
        "name":"Smoothing Type",
        "keyword":"SmoothingType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "201000A6":{
        "tag":"(2010,00A6)",
        "name":"Default Magnification Type",
        "keyword":"DefaultMagnificationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "201000A7":{
        "tag":"(2010,00A7)",
        "name":"Other Magnification Types Available",
        "keyword":"OtherMagnificationTypesAvailable",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "201000A8":{
        "tag":"(2010,00A8)",
        "name":"Default Smoothing Type",
        "keyword":"DefaultSmoothingType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "201000A9":{
        "tag":"(2010,00A9)",
        "name":"Other Smoothing Types Available",
        "keyword":"OtherSmoothingTypesAvailable",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "20100100":{
        "tag":"(2010,0100)",
        "name":"Border Density",
        "keyword":"BorderDensity",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20100110":{
        "tag":"(2010,0110)",
        "name":"Empty Image Density",
        "keyword":"EmptyImageDensity",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20100120":{
        "tag":"(2010,0120)",
        "name":"Min Density",
        "keyword":"MinDensity",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "20100130":{
        "tag":"(2010,0130)",
        "name":"Max Density",
        "keyword":"MaxDensity",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "20100140":{
        "tag":"(2010,0140)",
        "name":"Trim",
        "keyword":"Trim",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20100150":{
        "tag":"(2010,0150)",
        "name":"Configuration Information",
        "keyword":"ConfigurationInformation",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "20100152":{
        "tag":"(2010,0152)",
        "name":"Configuration Information Description",
        "keyword":"ConfigurationInformationDescription",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "20100154":{
        "tag":"(2010,0154)",
        "name":"Maximum Collated Films",
        "keyword":"MaximumCollatedFilms",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "2010015E":{
        "tag":"(2010,015E)",
        "name":"Illumination",
        "keyword":"Illumination",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "20100160":{
        "tag":"(2010,0160)",
        "name":"Reflected Ambient Light",
        "keyword":"ReflectedAmbientLight",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "20100376":{
        "tag":"(2010,0376)",
        "name":"Printer Pixel Spacing",
        "keyword":"PrinterPixelSpacing",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "20100500":{
        "tag":"(2010,0500)",
        "name":"Referenced Film Session Sequence",
        "keyword":"ReferencedFilmSessionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "20100510":{
        "tag":"(2010,0510)",
        "name":"Referenced Image Box Sequence",
        "keyword":"ReferencedImageBoxSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "20100520":{
        "tag":"(2010,0520)",
        "name":"Referenced Basic Annotation Box Sequence",
        "keyword":"ReferencedBasicAnnotationBoxSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "20200010":{
        "tag":"(2020,0010)",
        "name":"Image Box Position",
        "keyword":"ImageBoxPosition",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "20200020":{
        "tag":"(2020,0020)",
        "name":"Polarity",
        "keyword":"Polarity",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20200030":{
        "tag":"(2020,0030)",
        "name":"Requested Image Size",
        "keyword":"RequestedImageSize",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "20200040":{
        "tag":"(2020,0040)",
        "name":"Requested Decimate/Crop Behavior",
        "keyword":"RequestedDecimateCropBehavior",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20200050":{
        "tag":"(2020,0050)",
        "name":"Requested Resolution ID",
        "keyword":"RequestedResolutionID",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "202000A0":{
        "tag":"(2020,00A0)",
        "name":"Requested Image Size Flag",
        "keyword":"RequestedImageSizeFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "202000A2":{
        "tag":"(2020,00A2)",
        "name":"Decimate/Crop Result",
        "keyword":"DecimateCropResult",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20200110":{
        "tag":"(2020,0110)",
        "name":"Basic Grayscale Image Sequence",
        "keyword":"BasicGrayscaleImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "20200111":{
        "tag":"(2020,0111)",
        "name":"Basic Color Image Sequence",
        "keyword":"BasicColorImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "20200130":{
        "tag":"(2020,0130)",
        "name":"Referenced Image Overlay Box Sequence",
        "keyword":"ReferencedImageOverlayBoxSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "20200140":{
        "tag":"(2020,0140)",
        "name":"Referenced VOI LUT Box Sequence",
        "keyword":"ReferencedVOILUTBoxSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "20300010":{
        "tag":"(2030,0010)",
        "name":"Annotation Position",
        "keyword":"AnnotationPosition",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "20300020":{
        "tag":"(2030,0020)",
        "name":"Text String",
        "keyword":"TextString",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "20400010":{
        "tag":"(2040,0010)",
        "name":"Referenced Overlay Plane Sequence",
        "keyword":"ReferencedOverlayPlaneSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "20400011":{
        "tag":"(2040,0011)",
        "name":"Referenced Overlay Plane Groups",
        "keyword":"ReferencedOverlayPlaneGroups",
        "vr":"US",
        "vm":"1-99",
        "retired":true
    },
    "20400020":{
        "tag":"(2040,0020)",
        "name":"Overlay Pixel Data Sequence",
        "keyword":"OverlayPixelDataSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "20400060":{
        "tag":"(2040,0060)",
        "name":"Overlay Magnification Type",
        "keyword":"OverlayMagnificationType",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "20400070":{
        "tag":"(2040,0070)",
        "name":"Overlay Smoothing Type",
        "keyword":"OverlaySmoothingType",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "20400072":{
        "tag":"(2040,0072)",
        "name":"Overlay or Image Magnification",
        "keyword":"OverlayOrImageMagnification",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "20400074":{
        "tag":"(2040,0074)",
        "name":"Magnify to Number of Columns",
        "keyword":"MagnifyToNumberOfColumns",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "20400080":{
        "tag":"(2040,0080)",
        "name":"Overlay Foreground Density",
        "keyword":"OverlayForegroundDensity",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "20400082":{
        "tag":"(2040,0082)",
        "name":"Overlay Background Density",
        "keyword":"OverlayBackgroundDensity",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "20400090":{
        "tag":"(2040,0090)",
        "name":"Overlay Mode",
        "keyword":"OverlayMode",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "20400100":{
        "tag":"(2040,0100)",
        "name":"Threshold Density",
        "keyword":"ThresholdDensity",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "20400500":{
        "tag":"(2040,0500)",
        "name":"Referenced Image Box Sequence (Retired)",
        "keyword":"ReferencedImageBoxSequenceRetired",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "20500010":{
        "tag":"(2050,0010)",
        "name":"Presentation LUT Sequence",
        "keyword":"PresentationLUTSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "20500020":{
        "tag":"(2050,0020)",
        "name":"Presentation LUT Shape",
        "keyword":"PresentationLUTShape",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "20500500":{
        "tag":"(2050,0500)",
        "name":"Referenced Presentation LUT Sequence",
        "keyword":"ReferencedPresentationLUTSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "21000010":{
        "tag":"(2100,0010)",
        "name":"Print Job ID",
        "keyword":"PrintJobID",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "21000020":{
        "tag":"(2100,0020)",
        "name":"Execution Status",
        "keyword":"ExecutionStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "21000030":{
        "tag":"(2100,0030)",
        "name":"Execution Status Info",
        "keyword":"ExecutionStatusInfo",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "21000040":{
        "tag":"(2100,0040)",
        "name":"Creation Date",
        "keyword":"CreationDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "21000050":{
        "tag":"(2100,0050)",
        "name":"Creation Time",
        "keyword":"CreationTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "21000070":{
        "tag":"(2100,0070)",
        "name":"Originator",
        "keyword":"Originator",
        "vr":"AE",
        "vm":"1",
        "retired":false
    },
    "21000140":{
        "tag":"(2100,0140)",
        "name":"Destination AE",
        "keyword":"DestinationAE",
        "vr":"AE",
        "vm":"1",
        "retired":false
    },
    "21000160":{
        "tag":"(2100,0160)",
        "name":"Owner ID",
        "keyword":"OwnerID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "21000170":{
        "tag":"(2100,0170)",
        "name":"Number of Films",
        "keyword":"NumberOfFilms",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "21000500":{
        "tag":"(2100,0500)",
        "name":"Referenced Print Job Sequence (Pull Stored Print)",
        "keyword":"ReferencedPrintJobSequencePullStoredPrint",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "21100010":{
        "tag":"(2110,0010)",
        "name":"Printer Status",
        "keyword":"PrinterStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "21100020":{
        "tag":"(2110,0020)",
        "name":"Printer Status Info",
        "keyword":"PrinterStatusInfo",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "21100030":{
        "tag":"(2110,0030)",
        "name":"Printer Name",
        "keyword":"PrinterName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "21100099":{
        "tag":"(2110,0099)",
        "name":"Print Queue ID",
        "keyword":"PrintQueueID",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "21200010":{
        "tag":"(2120,0010)",
        "name":"Queue Status",
        "keyword":"QueueStatus",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "21200050":{
        "tag":"(2120,0050)",
        "name":"Print Job Description Sequence",
        "keyword":"PrintJobDescriptionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "21200070":{
        "tag":"(2120,0070)",
        "name":"Referenced Print Job Sequence",
        "keyword":"ReferencedPrintJobSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "21300010":{
        "tag":"(2130,0010)",
        "name":"Print Management Capabilities Sequence",
        "keyword":"PrintManagementCapabilitiesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "21300015":{
        "tag":"(2130,0015)",
        "name":"Printer Characteristics Sequence",
        "keyword":"PrinterCharacteristicsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "21300030":{
        "tag":"(2130,0030)",
        "name":"Film Box Content Sequence",
        "keyword":"FilmBoxContentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "21300040":{
        "tag":"(2130,0040)",
        "name":"Image Box Content Sequence",
        "keyword":"ImageBoxContentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "21300050":{
        "tag":"(2130,0050)",
        "name":"Annotation Content Sequence",
        "keyword":"AnnotationContentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "21300060":{
        "tag":"(2130,0060)",
        "name":"Image Overlay Box Content Sequence",
        "keyword":"ImageOverlayBoxContentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "21300080":{
        "tag":"(2130,0080)",
        "name":"Presentation LUT Content Sequence",
        "keyword":"PresentationLUTContentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "213000A0":{
        "tag":"(2130,00A0)",
        "name":"Proposed Study Sequence",
        "keyword":"ProposedStudySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "213000C0":{
        "tag":"(2130,00C0)",
        "name":"Original Image Sequence",
        "keyword":"OriginalImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "22000001":{
        "tag":"(2200,0001)",
        "name":"Label Using Information Extracted From Instances",
        "keyword":"LabelUsingInformationExtractedFromInstances",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "22000002":{
        "tag":"(2200,0002)",
        "name":"Label Text",
        "keyword":"LabelText",
        "vr":"UT",
        "vm":"1",
        "retired":false
    },
    "22000003":{
        "tag":"(2200,0003)",
        "name":"Label Style Selection",
        "keyword":"LabelStyleSelection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "22000004":{
        "tag":"(2200,0004)",
        "name":"Media Disposition",
        "keyword":"MediaDisposition",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "22000005":{
        "tag":"(2200,0005)",
        "name":"Barcode Value",
        "keyword":"BarcodeValue",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "22000006":{
        "tag":"(2200,0006)",
        "name":"Barcode Symbology",
        "keyword":"BarcodeSymbology",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "22000007":{
        "tag":"(2200,0007)",
        "name":"Allow Media Splitting",
        "keyword":"AllowMediaSplitting",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "22000008":{
        "tag":"(2200,0008)",
        "name":"Include Non-DICOM Objects",
        "keyword":"IncludeNonDICOMObjects",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "22000009":{
        "tag":"(2200,0009)",
        "name":"Include Display Application",
        "keyword":"IncludeDisplayApplication",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "2200000A":{
        "tag":"(2200,000A)",
        "name":"Preserve Composite Instances After Media Creation",
        "keyword":"PreserveCompositeInstancesAfterMediaCreation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "2200000B":{
        "tag":"(2200,000B)",
        "name":"Total Number of Pieces of Media Created",
        "keyword":"TotalNumberOfPiecesOfMediaCreated",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "2200000C":{
        "tag":"(2200,000C)",
        "name":"Requested Media Application Profile",
        "keyword":"RequestedMediaApplicationProfile",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "2200000D":{
        "tag":"(2200,000D)",
        "name":"Referenced Storage Media Sequence",
        "keyword":"ReferencedStorageMediaSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "2200000E":{
        "tag":"(2200,000E)",
        "name":"Failure Attributes",
        "keyword":"FailureAttributes",
        "vr":"AT",
        "vm":"1-n",
        "retired":false
    },
    "2200000F":{
        "tag":"(2200,000F)",
        "name":"Allow Lossy Compression",
        "keyword":"AllowLossyCompression",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "22000020":{
        "tag":"(2200,0020)",
        "name":"Request Priority",
        "keyword":"RequestPriority",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30020002":{
        "tag":"(3002,0002)",
        "name":"RT Image Label",
        "keyword":"RTImageLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "30020003":{
        "tag":"(3002,0003)",
        "name":"RT Image Name",
        "keyword":"RTImageName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "30020004":{
        "tag":"(3002,0004)",
        "name":"RT Image Description",
        "keyword":"RTImageDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "3002000A":{
        "tag":"(3002,000A)",
        "name":"Reported Values Origin",
        "keyword":"ReportedValuesOrigin",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "3002000C":{
        "tag":"(3002,000C)",
        "name":"RT Image Plane",
        "keyword":"RTImagePlane",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "3002000D":{
        "tag":"(3002,000D)",
        "name":"X-Ray Image Receptor Translation",
        "keyword":"XRayImageReceptorTranslation",
        "vr":"DS",
        "vm":"3",
        "retired":false
    },
    "3002000E":{
        "tag":"(3002,000E)",
        "name":"X-Ray Image Receptor Angle",
        "keyword":"XRayImageReceptorAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30020010":{
        "tag":"(3002,0010)",
        "name":"RT Image Orientation",
        "keyword":"RTImageOrientation",
        "vr":"DS",
        "vm":"6",
        "retired":false
    },
    "30020011":{
        "tag":"(3002,0011)",
        "name":"Image Plane Pixel Spacing",
        "keyword":"ImagePlanePixelSpacing",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "30020012":{
        "tag":"(3002,0012)",
        "name":"RT Image Position",
        "keyword":"RTImagePosition",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "30020020":{
        "tag":"(3002,0020)",
        "name":"Radiation Machine Name",
        "keyword":"RadiationMachineName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "30020022":{
        "tag":"(3002,0022)",
        "name":"Radiation Machine SAD",
        "keyword":"RadiationMachineSAD",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30020024":{
        "tag":"(3002,0024)",
        "name":"Radiation Machine SSD",
        "keyword":"RadiationMachineSSD",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30020026":{
        "tag":"(3002,0026)",
        "name":"RT Image SID",
        "keyword":"RTImageSID",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30020028":{
        "tag":"(3002,0028)",
        "name":"Source to Reference Object Distance",
        "keyword":"SourceToReferenceObjectDistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30020029":{
        "tag":"(3002,0029)",
        "name":"Fraction Number",
        "keyword":"FractionNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30020030":{
        "tag":"(3002,0030)",
        "name":"Exposure Sequence",
        "keyword":"ExposureSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30020032":{
        "tag":"(3002,0032)",
        "name":"Meterset Exposure",
        "keyword":"MetersetExposure",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30020034":{
        "tag":"(3002,0034)",
        "name":"Diaphragm Position",
        "keyword":"DiaphragmPosition",
        "vr":"DS",
        "vm":"4",
        "retired":false
    },
    "30020040":{
        "tag":"(3002,0040)",
        "name":"Fluence Map Sequence",
        "keyword":"FluenceMapSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30020041":{
        "tag":"(3002,0041)",
        "name":"Fluence Data Source",
        "keyword":"FluenceDataSource",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30020042":{
        "tag":"(3002,0042)",
        "name":"Fluence Data Scale",
        "keyword":"FluenceDataScale",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30020050":{
        "tag":"(3002,0050)",
        "name":"Primary Fluence Mode Sequence",
        "keyword":"PrimaryFluenceModeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30020051":{
        "tag":"(3002,0051)",
        "name":"Fluence Mode",
        "keyword":"FluenceMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30020052":{
        "tag":"(3002,0052)",
        "name":"Fluence Mode ID",
        "keyword":"FluenceModeID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "30040001":{
        "tag":"(3004,0001)",
        "name":"DVH Type",
        "keyword":"DVHType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30040002":{
        "tag":"(3004,0002)",
        "name":"Dose Units",
        "keyword":"DoseUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30040004":{
        "tag":"(3004,0004)",
        "name":"Dose Type",
        "keyword":"DoseType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30040005":{
        "tag":"(3004,0005)",
        "name":"Spatial Transform of Dose",
        "keyword":"SpatialTransformOfDose",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30040006":{
        "tag":"(3004,0006)",
        "name":"Dose Comment",
        "keyword":"DoseComment",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "30040008":{
        "tag":"(3004,0008)",
        "name":"Normalization Point",
        "keyword":"NormalizationPoint",
        "vr":"DS",
        "vm":"3",
        "retired":false
    },
    "3004000A":{
        "tag":"(3004,000A)",
        "name":"Dose Summation Type",
        "keyword":"DoseSummationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "3004000C":{
        "tag":"(3004,000C)",
        "name":"Grid Frame Offset Vector",
        "keyword":"GridFrameOffsetVector",
        "vr":"DS",
        "vm":"2-n",
        "retired":false
    },
    "3004000E":{
        "tag":"(3004,000E)",
        "name":"Dose Grid Scaling",
        "keyword":"DoseGridScaling",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30040010":{
        "tag":"(3004,0010)",
        "name":"RT Dose ROI Sequence",
        "keyword":"RTDoseROISequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30040012":{
        "tag":"(3004,0012)",
        "name":"Dose Value",
        "keyword":"DoseValue",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30040014":{
        "tag":"(3004,0014)",
        "name":"Tissue Heterogeneity Correction",
        "keyword":"TissueHeterogeneityCorrection",
        "vr":"CS",
        "vm":"1-3",
        "retired":false
    },
    "30040040":{
        "tag":"(3004,0040)",
        "name":"DVH Normalization Point",
        "keyword":"DVHNormalizationPoint",
        "vr":"DS",
        "vm":"3",
        "retired":false
    },
    "30040042":{
        "tag":"(3004,0042)",
        "name":"DVH Normalization Dose Value",
        "keyword":"DVHNormalizationDoseValue",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30040050":{
        "tag":"(3004,0050)",
        "name":"DVH Sequence",
        "keyword":"DVHSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30040052":{
        "tag":"(3004,0052)",
        "name":"DVH Dose Scaling",
        "keyword":"DVHDoseScaling",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30040054":{
        "tag":"(3004,0054)",
        "name":"DVH Volume Units",
        "keyword":"DVHVolumeUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30040056":{
        "tag":"(3004,0056)",
        "name":"DVH Number of Bins",
        "keyword":"DVHNumberOfBins",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30040058":{
        "tag":"(3004,0058)",
        "name":"DVH Data",
        "keyword":"DVHData",
        "vr":"DS",
        "vm":"2-2n",
        "retired":false
    },
    "30040060":{
        "tag":"(3004,0060)",
        "name":"DVH Referenced ROI Sequence",
        "keyword":"DVHReferencedROISequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30040062":{
        "tag":"(3004,0062)",
        "name":"DVH ROI Contribution Type",
        "keyword":"DVHROIContributionType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30040070":{
        "tag":"(3004,0070)",
        "name":"DVH Minimum Dose",
        "keyword":"DVHMinimumDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30040072":{
        "tag":"(3004,0072)",
        "name":"DVH Maximum Dose",
        "keyword":"DVHMaximumDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30040074":{
        "tag":"(3004,0074)",
        "name":"DVH Mean Dose",
        "keyword":"DVHMeanDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30060002":{
        "tag":"(3006,0002)",
        "name":"Structure Set Label",
        "keyword":"StructureSetLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "30060004":{
        "tag":"(3006,0004)",
        "name":"Structure Set Name",
        "keyword":"StructureSetName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "30060006":{
        "tag":"(3006,0006)",
        "name":"Structure Set Description",
        "keyword":"StructureSetDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "30060008":{
        "tag":"(3006,0008)",
        "name":"Structure Set Date",
        "keyword":"StructureSetDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "30060009":{
        "tag":"(3006,0009)",
        "name":"Structure Set Time",
        "keyword":"StructureSetTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "30060010":{
        "tag":"(3006,0010)",
        "name":"Referenced Frame of Reference Sequence",
        "keyword":"ReferencedFrameOfReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30060012":{
        "tag":"(3006,0012)",
        "name":"RT Referenced Study Sequence",
        "keyword":"RTReferencedStudySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30060014":{
        "tag":"(3006,0014)",
        "name":"RT Referenced Series Sequence",
        "keyword":"RTReferencedSeriesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30060016":{
        "tag":"(3006,0016)",
        "name":"Contour Image Sequence",
        "keyword":"ContourImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30060018":{
        "tag":"(3006,0018)",
        "name":"Predecessor Structure Set Sequence",
        "keyword":"PredecessorStructureSetSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30060020":{
        "tag":"(3006,0020)",
        "name":"Structure Set ROI Sequence",
        "keyword":"StructureSetROISequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30060022":{
        "tag":"(3006,0022)",
        "name":"ROI Number",
        "keyword":"ROINumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30060024":{
        "tag":"(3006,0024)",
        "name":"Referenced Frame of Reference UID",
        "keyword":"ReferencedFrameOfReferenceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "30060026":{
        "tag":"(3006,0026)",
        "name":"ROI Name",
        "keyword":"ROIName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "30060028":{
        "tag":"(3006,0028)",
        "name":"ROI Description",
        "keyword":"ROIDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "3006002A":{
        "tag":"(3006,002A)",
        "name":"ROI Display Color",
        "keyword":"ROIDisplayColor",
        "vr":"IS",
        "vm":"3",
        "retired":false
    },
    "3006002C":{
        "tag":"(3006,002C)",
        "name":"ROI Volume",
        "keyword":"ROIVolume",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30060030":{
        "tag":"(3006,0030)",
        "name":"RT Related ROI Sequence",
        "keyword":"RTRelatedROISequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30060033":{
        "tag":"(3006,0033)",
        "name":"RT ROI Relationship",
        "keyword":"RTROIRelationship",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30060036":{
        "tag":"(3006,0036)",
        "name":"ROI Generation Algorithm",
        "keyword":"ROIGenerationAlgorithm",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30060038":{
        "tag":"(3006,0038)",
        "name":"ROI Generation Description",
        "keyword":"ROIGenerationDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "30060039":{
        "tag":"(3006,0039)",
        "name":"ROI Contour Sequence",
        "keyword":"ROIContourSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30060040":{
        "tag":"(3006,0040)",
        "name":"Contour Sequence",
        "keyword":"ContourSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30060042":{
        "tag":"(3006,0042)",
        "name":"Contour Geometric Type",
        "keyword":"ContourGeometricType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30060044":{
        "tag":"(3006,0044)",
        "name":"Contour Slab Thickness",
        "keyword":"ContourSlabThickness",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30060045":{
        "tag":"(3006,0045)",
        "name":"Contour Offset Vector",
        "keyword":"ContourOffsetVector",
        "vr":"DS",
        "vm":"3",
        "retired":false
    },
    "30060046":{
        "tag":"(3006,0046)",
        "name":"Number of Contour Points",
        "keyword":"NumberOfContourPoints",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30060048":{
        "tag":"(3006,0048)",
        "name":"Contour Number",
        "keyword":"ContourNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30060049":{
        "tag":"(3006,0049)",
        "name":"Attached Contours",
        "keyword":"AttachedContours",
        "vr":"IS",
        "vm":"1-n",
        "retired":false
    },
    "30060050":{
        "tag":"(3006,0050)",
        "name":"Contour Data",
        "keyword":"ContourData",
        "vr":"DS",
        "vm":"3-3n",
        "retired":false
    },
    "30060080":{
        "tag":"(3006,0080)",
        "name":"RT ROI Observations Sequence",
        "keyword":"RTROIObservationsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30060082":{
        "tag":"(3006,0082)",
        "name":"Observation Number",
        "keyword":"ObservationNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30060084":{
        "tag":"(3006,0084)",
        "name":"Referenced ROI Number",
        "keyword":"ReferencedROINumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30060085":{
        "tag":"(3006,0085)",
        "name":"ROI Observation Label",
        "keyword":"ROIObservationLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "30060086":{
        "tag":"(3006,0086)",
        "name":"RT ROI Identification Code Sequence",
        "keyword":"RTROIIdentificationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30060088":{
        "tag":"(3006,0088)",
        "name":"ROI Observation Description",
        "keyword":"ROIObservationDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300600A0":{
        "tag":"(3006,00A0)",
        "name":"Related RT ROI Observations Sequence",
        "keyword":"RelatedRTROIObservationsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300600A4":{
        "tag":"(3006,00A4)",
        "name":"RT ROI Interpreted Type",
        "keyword":"RTROIInterpretedType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300600A6":{
        "tag":"(3006,00A6)",
        "name":"ROI Interpreter",
        "keyword":"ROIInterpreter",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "300600B0":{
        "tag":"(3006,00B0)",
        "name":"ROI Physical Properties Sequence",
        "keyword":"ROIPhysicalPropertiesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300600B2":{
        "tag":"(3006,00B2)",
        "name":"ROI Physical Property",
        "keyword":"ROIPhysicalProperty",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300600B4":{
        "tag":"(3006,00B4)",
        "name":"ROI Physical Property Value",
        "keyword":"ROIPhysicalPropertyValue",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300600B6":{
        "tag":"(3006,00B6)",
        "name":"ROI Elemental Composition Sequence",
        "keyword":"ROIElementalCompositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300600B7":{
        "tag":"(3006,00B7)",
        "name":"ROI Elemental Composition Atomic Number",
        "keyword":"ROIElementalCompositionAtomicNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "300600B8":{
        "tag":"(3006,00B8)",
        "name":"ROI Elemental Composition Atomic Mass Fraction",
        "keyword":"ROIElementalCompositionAtomicMassFraction",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300600B9":{
        "tag":"(3006,00B9)",
        "name":"Additional RT ROI Identification Code Sequence",
        "keyword":"AdditionalRTROIIdentificationCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "300600C0":{
        "tag":"(3006,00C0)",
        "name":"Frame of Reference Relationship Sequence",
        "keyword":"FrameOfReferenceRelationshipSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "300600C2":{
        "tag":"(3006,00C2)",
        "name":"Related Frame of Reference UID",
        "keyword":"RelatedFrameOfReferenceUID",
        "vr":"UI",
        "vm":"1",
        "retired":true
    },
    "300600C4":{
        "tag":"(3006,00C4)",
        "name":"Frame of Reference Transformation Type",
        "keyword":"FrameOfReferenceTransformationType",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "300600C6":{
        "tag":"(3006,00C6)",
        "name":"Frame of Reference Transformation Matrix",
        "keyword":"FrameOfReferenceTransformationMatrix",
        "vr":"DS",
        "vm":"16",
        "retired":false
    },
    "300600C8":{
        "tag":"(3006,00C8)",
        "name":"Frame of Reference Transformation Comment",
        "keyword":"FrameOfReferenceTransformationComment",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "30080010":{
        "tag":"(3008,0010)",
        "name":"Measured Dose Reference Sequence",
        "keyword":"MeasuredDoseReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080012":{
        "tag":"(3008,0012)",
        "name":"Measured Dose Description",
        "keyword":"MeasuredDoseDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "30080014":{
        "tag":"(3008,0014)",
        "name":"Measured Dose Type",
        "keyword":"MeasuredDoseType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30080016":{
        "tag":"(3008,0016)",
        "name":"Measured Dose Value",
        "keyword":"MeasuredDoseValue",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080020":{
        "tag":"(3008,0020)",
        "name":"Treatment Session Beam Sequence",
        "keyword":"TreatmentSessionBeamSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080021":{
        "tag":"(3008,0021)",
        "name":"Treatment Session Ion Beam Sequence",
        "keyword":"TreatmentSessionIonBeamSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080022":{
        "tag":"(3008,0022)",
        "name":"Current Fraction Number",
        "keyword":"CurrentFractionNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30080024":{
        "tag":"(3008,0024)",
        "name":"Treatment Control Point Date",
        "keyword":"TreatmentControlPointDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "30080025":{
        "tag":"(3008,0025)",
        "name":"Treatment Control Point Time",
        "keyword":"TreatmentControlPointTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "3008002A":{
        "tag":"(3008,002A)",
        "name":"Treatment Termination Status",
        "keyword":"TreatmentTerminationStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "3008002B":{
        "tag":"(3008,002B)",
        "name":"Treatment Termination Code",
        "keyword":"TreatmentTerminationCode",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "3008002C":{
        "tag":"(3008,002C)",
        "name":"Treatment Verification Status",
        "keyword":"TreatmentVerificationStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30080030":{
        "tag":"(3008,0030)",
        "name":"Referenced Treatment Record Sequence",
        "keyword":"ReferencedTreatmentRecordSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080032":{
        "tag":"(3008,0032)",
        "name":"Specified Primary Meterset",
        "keyword":"SpecifiedPrimaryMeterset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080033":{
        "tag":"(3008,0033)",
        "name":"Specified Secondary Meterset",
        "keyword":"SpecifiedSecondaryMeterset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080036":{
        "tag":"(3008,0036)",
        "name":"Delivered Primary Meterset",
        "keyword":"DeliveredPrimaryMeterset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080037":{
        "tag":"(3008,0037)",
        "name":"Delivered Secondary Meterset",
        "keyword":"DeliveredSecondaryMeterset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "3008003A":{
        "tag":"(3008,003A)",
        "name":"Specified Treatment Time",
        "keyword":"SpecifiedTreatmentTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "3008003B":{
        "tag":"(3008,003B)",
        "name":"Delivered Treatment Time",
        "keyword":"DeliveredTreatmentTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080040":{
        "tag":"(3008,0040)",
        "name":"Control Point Delivery Sequence",
        "keyword":"ControlPointDeliverySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080041":{
        "tag":"(3008,0041)",
        "name":"Ion Control Point Delivery Sequence",
        "keyword":"IonControlPointDeliverySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080042":{
        "tag":"(3008,0042)",
        "name":"Specified Meterset",
        "keyword":"SpecifiedMeterset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080044":{
        "tag":"(3008,0044)",
        "name":"Delivered Meterset",
        "keyword":"DeliveredMeterset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080045":{
        "tag":"(3008,0045)",
        "name":"Meterset Rate Set",
        "keyword":"MetersetRateSet",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "30080046":{
        "tag":"(3008,0046)",
        "name":"Meterset Rate Delivered",
        "keyword":"MetersetRateDelivered",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "30080047":{
        "tag":"(3008,0047)",
        "name":"Scan Spot Metersets Delivered",
        "keyword":"ScanSpotMetersetsDelivered",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "30080048":{
        "tag":"(3008,0048)",
        "name":"Dose Rate Delivered",
        "keyword":"DoseRateDelivered",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080050":{
        "tag":"(3008,0050)",
        "name":"Treatment Summary Calculated Dose Reference Sequence",
        "keyword":"TreatmentSummaryCalculatedDoseReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080052":{
        "tag":"(3008,0052)",
        "name":"Cumulative Dose to Dose Reference",
        "keyword":"CumulativeDoseToDoseReference",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080054":{
        "tag":"(3008,0054)",
        "name":"First Treatment Date",
        "keyword":"FirstTreatmentDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "30080056":{
        "tag":"(3008,0056)",
        "name":"Most Recent Treatment Date",
        "keyword":"MostRecentTreatmentDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "3008005A":{
        "tag":"(3008,005A)",
        "name":"Number of Fractions Delivered",
        "keyword":"NumberOfFractionsDelivered",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30080060":{
        "tag":"(3008,0060)",
        "name":"Override Sequence",
        "keyword":"OverrideSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080061":{
        "tag":"(3008,0061)",
        "name":"Parameter Sequence Pointer",
        "keyword":"ParameterSequencePointer",
        "vr":"AT",
        "vm":"1",
        "retired":false
    },
    "30080062":{
        "tag":"(3008,0062)",
        "name":"Override Parameter Pointer",
        "keyword":"OverrideParameterPointer",
        "vr":"AT",
        "vm":"1",
        "retired":false
    },
    "30080063":{
        "tag":"(3008,0063)",
        "name":"Parameter Item Index",
        "keyword":"ParameterItemIndex",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30080064":{
        "tag":"(3008,0064)",
        "name":"Measured Dose Reference Number",
        "keyword":"MeasuredDoseReferenceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30080065":{
        "tag":"(3008,0065)",
        "name":"Parameter Pointer",
        "keyword":"ParameterPointer",
        "vr":"AT",
        "vm":"1",
        "retired":false
    },
    "30080066":{
        "tag":"(3008,0066)",
        "name":"Override Reason",
        "keyword":"OverrideReason",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "30080067":{
        "tag":"(3008,0067)",
        "name":"Parameter Value Number",
        "keyword":"ParameterValueNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "30080068":{
        "tag":"(3008,0068)",
        "name":"Corrected Parameter Sequence",
        "keyword":"CorrectedParameterSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "3008006A":{
        "tag":"(3008,006A)",
        "name":"Correction Value",
        "keyword":"CorrectionValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "30080070":{
        "tag":"(3008,0070)",
        "name":"Calculated Dose Reference Sequence",
        "keyword":"CalculatedDoseReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080072":{
        "tag":"(3008,0072)",
        "name":"Calculated Dose Reference Number",
        "keyword":"CalculatedDoseReferenceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30080074":{
        "tag":"(3008,0074)",
        "name":"Calculated Dose Reference Description",
        "keyword":"CalculatedDoseReferenceDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "30080076":{
        "tag":"(3008,0076)",
        "name":"Calculated Dose Reference Dose Value",
        "keyword":"CalculatedDoseReferenceDoseValue",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080078":{
        "tag":"(3008,0078)",
        "name":"Start Meterset",
        "keyword":"StartMeterset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "3008007A":{
        "tag":"(3008,007A)",
        "name":"End Meterset",
        "keyword":"EndMeterset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080080":{
        "tag":"(3008,0080)",
        "name":"Referenced Measured Dose Reference Sequence",
        "keyword":"ReferencedMeasuredDoseReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080082":{
        "tag":"(3008,0082)",
        "name":"Referenced Measured Dose Reference Number",
        "keyword":"ReferencedMeasuredDoseReferenceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30080090":{
        "tag":"(3008,0090)",
        "name":"Referenced Calculated Dose Reference Sequence",
        "keyword":"ReferencedCalculatedDoseReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080092":{
        "tag":"(3008,0092)",
        "name":"Referenced Calculated Dose Reference Number",
        "keyword":"ReferencedCalculatedDoseReferenceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300800A0":{
        "tag":"(3008,00A0)",
        "name":"Beam Limiting Device Leaf Pairs Sequence",
        "keyword":"BeamLimitingDeviceLeafPairsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300800B0":{
        "tag":"(3008,00B0)",
        "name":"Recorded Wedge Sequence",
        "keyword":"RecordedWedgeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300800C0":{
        "tag":"(3008,00C0)",
        "name":"Recorded Compensator Sequence",
        "keyword":"RecordedCompensatorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300800D0":{
        "tag":"(3008,00D0)",
        "name":"Recorded Block Sequence",
        "keyword":"RecordedBlockSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300800E0":{
        "tag":"(3008,00E0)",
        "name":"Treatment Summary Measured Dose Reference Sequence",
        "keyword":"TreatmentSummaryMeasuredDoseReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300800F0":{
        "tag":"(3008,00F0)",
        "name":"Recorded Snout Sequence",
        "keyword":"RecordedSnoutSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300800F2":{
        "tag":"(3008,00F2)",
        "name":"Recorded Range Shifter Sequence",
        "keyword":"RecordedRangeShifterSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300800F4":{
        "tag":"(3008,00F4)",
        "name":"Recorded Lateral Spreading Device Sequence",
        "keyword":"RecordedLateralSpreadingDeviceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300800F6":{
        "tag":"(3008,00F6)",
        "name":"Recorded Range Modulator Sequence",
        "keyword":"RecordedRangeModulatorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080100":{
        "tag":"(3008,0100)",
        "name":"Recorded Source Sequence",
        "keyword":"RecordedSourceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080105":{
        "tag":"(3008,0105)",
        "name":"Source Serial Number",
        "keyword":"SourceSerialNumber",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "30080110":{
        "tag":"(3008,0110)",
        "name":"Treatment Session Application Setup Sequence",
        "keyword":"TreatmentSessionApplicationSetupSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080116":{
        "tag":"(3008,0116)",
        "name":"Application Setup Check",
        "keyword":"ApplicationSetupCheck",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30080120":{
        "tag":"(3008,0120)",
        "name":"Recorded Brachy Accessory Device Sequence",
        "keyword":"RecordedBrachyAccessoryDeviceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080122":{
        "tag":"(3008,0122)",
        "name":"Referenced Brachy Accessory Device Number",
        "keyword":"ReferencedBrachyAccessoryDeviceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30080130":{
        "tag":"(3008,0130)",
        "name":"Recorded Channel Sequence",
        "keyword":"RecordedChannelSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080132":{
        "tag":"(3008,0132)",
        "name":"Specified Channel Total Time",
        "keyword":"SpecifiedChannelTotalTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080134":{
        "tag":"(3008,0134)",
        "name":"Delivered Channel Total Time",
        "keyword":"DeliveredChannelTotalTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080136":{
        "tag":"(3008,0136)",
        "name":"Specified Number of Pulses",
        "keyword":"SpecifiedNumberOfPulses",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30080138":{
        "tag":"(3008,0138)",
        "name":"Delivered Number of Pulses",
        "keyword":"DeliveredNumberOfPulses",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "3008013A":{
        "tag":"(3008,013A)",
        "name":"Specified Pulse Repetition Interval",
        "keyword":"SpecifiedPulseRepetitionInterval",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "3008013C":{
        "tag":"(3008,013C)",
        "name":"Delivered Pulse Repetition Interval",
        "keyword":"DeliveredPulseRepetitionInterval",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "30080140":{
        "tag":"(3008,0140)",
        "name":"Recorded Source Applicator Sequence",
        "keyword":"RecordedSourceApplicatorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080142":{
        "tag":"(3008,0142)",
        "name":"Referenced Source Applicator Number",
        "keyword":"ReferencedSourceApplicatorNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30080150":{
        "tag":"(3008,0150)",
        "name":"Recorded Channel Shield Sequence",
        "keyword":"RecordedChannelShieldSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080152":{
        "tag":"(3008,0152)",
        "name":"Referenced Channel Shield Number",
        "keyword":"ReferencedChannelShieldNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30080160":{
        "tag":"(3008,0160)",
        "name":"Brachy Control Point Delivered Sequence",
        "keyword":"BrachyControlPointDeliveredSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080162":{
        "tag":"(3008,0162)",
        "name":"Safe Position Exit Date",
        "keyword":"SafePositionExitDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "30080164":{
        "tag":"(3008,0164)",
        "name":"Safe Position Exit Time",
        "keyword":"SafePositionExitTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "30080166":{
        "tag":"(3008,0166)",
        "name":"Safe Position Return Date",
        "keyword":"SafePositionReturnDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "30080168":{
        "tag":"(3008,0168)",
        "name":"Safe Position Return Time",
        "keyword":"SafePositionReturnTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "30080171":{
        "tag":"(3008,0171)",
        "name":"Pulse Specific Brachy Control Point Delivered Sequence",
        "keyword":"PulseSpecificBrachyControlPointDeliveredSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080172":{
        "tag":"(3008,0172)",
        "name":"Pulse Number",
        "keyword":"PulseNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "30080173":{
        "tag":"(3008,0173)",
        "name":"Brachy Pulse Control Point Delivered Sequence",
        "keyword":"BrachyPulseControlPointDeliveredSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080200":{
        "tag":"(3008,0200)",
        "name":"Current Treatment Status",
        "keyword":"CurrentTreatmentStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30080202":{
        "tag":"(3008,0202)",
        "name":"Treatment Status Comment",
        "keyword":"TreatmentStatusComment",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "30080220":{
        "tag":"(3008,0220)",
        "name":"Fraction Group Summary Sequence",
        "keyword":"FractionGroupSummarySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080223":{
        "tag":"(3008,0223)",
        "name":"Referenced Fraction Number",
        "keyword":"ReferencedFractionNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "30080224":{
        "tag":"(3008,0224)",
        "name":"Fraction Group Type",
        "keyword":"FractionGroupType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30080230":{
        "tag":"(3008,0230)",
        "name":"Beam Stopper Position",
        "keyword":"BeamStopperPosition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "30080240":{
        "tag":"(3008,0240)",
        "name":"Fraction Status Summary Sequence",
        "keyword":"FractionStatusSummarySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "30080250":{
        "tag":"(3008,0250)",
        "name":"Treatment Date",
        "keyword":"TreatmentDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "30080251":{
        "tag":"(3008,0251)",
        "name":"Treatment Time",
        "keyword":"TreatmentTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "300A0002":{
        "tag":"(300A,0002)",
        "name":"RT Plan Label",
        "keyword":"RTPlanLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0003":{
        "tag":"(300A,0003)",
        "name":"RT Plan Name",
        "keyword":"RTPlanName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0004":{
        "tag":"(300A,0004)",
        "name":"RT Plan Description",
        "keyword":"RTPlanDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300A0006":{
        "tag":"(300A,0006)",
        "name":"RT Plan Date",
        "keyword":"RTPlanDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "300A0007":{
        "tag":"(300A,0007)",
        "name":"RT Plan Time",
        "keyword":"RTPlanTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "300A0009":{
        "tag":"(300A,0009)",
        "name":"Treatment Protocols",
        "keyword":"TreatmentProtocols",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "300A000A":{
        "tag":"(300A,000A)",
        "name":"Plan Intent",
        "keyword":"PlanIntent",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A000B":{
        "tag":"(300A,000B)",
        "name":"Treatment Sites",
        "keyword":"TreatmentSites",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "300A000C":{
        "tag":"(300A,000C)",
        "name":"RT Plan Geometry",
        "keyword":"RTPlanGeometry",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A000E":{
        "tag":"(300A,000E)",
        "name":"Prescription Description",
        "keyword":"PrescriptionDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300A0010":{
        "tag":"(300A,0010)",
        "name":"Dose Reference Sequence",
        "keyword":"DoseReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0012":{
        "tag":"(300A,0012)",
        "name":"Dose Reference Number",
        "keyword":"DoseReferenceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0013":{
        "tag":"(300A,0013)",
        "name":"Dose Reference UID",
        "keyword":"DoseReferenceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "300A0014":{
        "tag":"(300A,0014)",
        "name":"Dose Reference Structure Type",
        "keyword":"DoseReferenceStructureType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0015":{
        "tag":"(300A,0015)",
        "name":"Nominal Beam Energy Unit",
        "keyword":"NominalBeamEnergyUnit",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0016":{
        "tag":"(300A,0016)",
        "name":"Dose Reference Description",
        "keyword":"DoseReferenceDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0018":{
        "tag":"(300A,0018)",
        "name":"Dose Reference Point Coordinates",
        "keyword":"DoseReferencePointCoordinates",
        "vr":"DS",
        "vm":"3",
        "retired":false
    },
    "300A001A":{
        "tag":"(300A,001A)",
        "name":"Nominal Prior Dose",
        "keyword":"NominalPriorDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0020":{
        "tag":"(300A,0020)",
        "name":"Dose Reference Type",
        "keyword":"DoseReferenceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0021":{
        "tag":"(300A,0021)",
        "name":"Constraint Weight",
        "keyword":"ConstraintWeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0022":{
        "tag":"(300A,0022)",
        "name":"Delivery Warning Dose",
        "keyword":"DeliveryWarningDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0023":{
        "tag":"(300A,0023)",
        "name":"Delivery Maximum Dose",
        "keyword":"DeliveryMaximumDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0025":{
        "tag":"(300A,0025)",
        "name":"Target Minimum Dose",
        "keyword":"TargetMinimumDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0026":{
        "tag":"(300A,0026)",
        "name":"Target Prescription Dose",
        "keyword":"TargetPrescriptionDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0027":{
        "tag":"(300A,0027)",
        "name":"Target Maximum Dose",
        "keyword":"TargetMaximumDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0028":{
        "tag":"(300A,0028)",
        "name":"Target Underdose Volume Fraction",
        "keyword":"TargetUnderdoseVolumeFraction",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A002A":{
        "tag":"(300A,002A)",
        "name":"Organ at Risk Full-volume Dose",
        "keyword":"OrganAtRiskFullVolumeDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A002B":{
        "tag":"(300A,002B)",
        "name":"Organ at Risk Limit Dose",
        "keyword":"OrganAtRiskLimitDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A002C":{
        "tag":"(300A,002C)",
        "name":"Organ at Risk Maximum Dose",
        "keyword":"OrganAtRiskMaximumDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A002D":{
        "tag":"(300A,002D)",
        "name":"Organ at Risk Overdose Volume Fraction",
        "keyword":"OrganAtRiskOverdoseVolumeFraction",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0040":{
        "tag":"(300A,0040)",
        "name":"Tolerance Table Sequence",
        "keyword":"ToleranceTableSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0042":{
        "tag":"(300A,0042)",
        "name":"Tolerance Table Number",
        "keyword":"ToleranceTableNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0043":{
        "tag":"(300A,0043)",
        "name":"Tolerance Table Label",
        "keyword":"ToleranceTableLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0044":{
        "tag":"(300A,0044)",
        "name":"Gantry Angle Tolerance",
        "keyword":"GantryAngleTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0046":{
        "tag":"(300A,0046)",
        "name":"Beam Limiting Device Angle Tolerance",
        "keyword":"BeamLimitingDeviceAngleTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0048":{
        "tag":"(300A,0048)",
        "name":"Beam Limiting Device Tolerance Sequence",
        "keyword":"BeamLimitingDeviceToleranceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A004A":{
        "tag":"(300A,004A)",
        "name":"Beam Limiting Device Position Tolerance",
        "keyword":"BeamLimitingDevicePositionTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A004B":{
        "tag":"(300A,004B)",
        "name":"Snout Position Tolerance",
        "keyword":"SnoutPositionTolerance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A004C":{
        "tag":"(300A,004C)",
        "name":"Patient Support Angle Tolerance",
        "keyword":"PatientSupportAngleTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A004E":{
        "tag":"(300A,004E)",
        "name":"Table Top Eccentric Angle Tolerance",
        "keyword":"TableTopEccentricAngleTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A004F":{
        "tag":"(300A,004F)",
        "name":"Table Top Pitch Angle Tolerance",
        "keyword":"TableTopPitchAngleTolerance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0050":{
        "tag":"(300A,0050)",
        "name":"Table Top Roll Angle Tolerance",
        "keyword":"TableTopRollAngleTolerance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0051":{
        "tag":"(300A,0051)",
        "name":"Table Top Vertical Position Tolerance",
        "keyword":"TableTopVerticalPositionTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0052":{
        "tag":"(300A,0052)",
        "name":"Table Top Longitudinal Position Tolerance",
        "keyword":"TableTopLongitudinalPositionTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0053":{
        "tag":"(300A,0053)",
        "name":"Table Top Lateral Position Tolerance",
        "keyword":"TableTopLateralPositionTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0055":{
        "tag":"(300A,0055)",
        "name":"RT Plan Relationship",
        "keyword":"RTPlanRelationship",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0070":{
        "tag":"(300A,0070)",
        "name":"Fraction Group Sequence",
        "keyword":"FractionGroupSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0071":{
        "tag":"(300A,0071)",
        "name":"Fraction Group Number",
        "keyword":"FractionGroupNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0072":{
        "tag":"(300A,0072)",
        "name":"Fraction Group Description",
        "keyword":"FractionGroupDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0078":{
        "tag":"(300A,0078)",
        "name":"Number of Fractions Planned",
        "keyword":"NumberOfFractionsPlanned",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0079":{
        "tag":"(300A,0079)",
        "name":"Number of Fraction Pattern Digits Per Day",
        "keyword":"NumberOfFractionPatternDigitsPerDay",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A007A":{
        "tag":"(300A,007A)",
        "name":"Repeat Fraction Cycle Length",
        "keyword":"RepeatFractionCycleLength",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A007B":{
        "tag":"(300A,007B)",
        "name":"Fraction Pattern",
        "keyword":"FractionPattern",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "300A0080":{
        "tag":"(300A,0080)",
        "name":"Number of Beams",
        "keyword":"NumberOfBeams",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0082":{
        "tag":"(300A,0082)",
        "name":"Beam Dose Specification Point",
        "keyword":"BeamDoseSpecificationPoint",
        "vr":"DS",
        "vm":"3",
        "retired":false
    },
    "300A0083":{
        "tag":"(300A,0083)",
        "name":"Referenced Dose Reference UID",
        "keyword":"ReferencedDoseReferenceUID",
        "vr":"UI",
        "vm":"1",
        "retired":false
    },
    "300A0084":{
        "tag":"(300A,0084)",
        "name":"Beam Dose",
        "keyword":"BeamDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0086":{
        "tag":"(300A,0086)",
        "name":"Beam Meterset",
        "keyword":"BeamMeterset",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0088":{
        "tag":"(300A,0088)",
        "name":"Beam Dose Point Depth",
        "keyword":"BeamDosePointDepth",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0089":{
        "tag":"(300A,0089)",
        "name":"Beam Dose Point Equivalent Depth",
        "keyword":"BeamDosePointEquivalentDepth",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A008A":{
        "tag":"(300A,008A)",
        "name":"Beam Dose Point SSD",
        "keyword":"BeamDosePointSSD",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A008B":{
        "tag":"(300A,008B)",
        "name":"Beam Dose Meaning",
        "keyword":"BeamDoseMeaning",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A008C":{
        "tag":"(300A,008C)",
        "name":"Beam Dose Verification Control Point Sequence",
        "keyword":"BeamDoseVerificationControlPointSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A008D":{
        "tag":"(300A,008D)",
        "name":"Average Beam Dose Point Depth",
        "keyword":"AverageBeamDosePointDepth",
        "vr":"FL",
        "vm":"1",
        "retired":true
    },
    "300A008E":{
        "tag":"(300A,008E)",
        "name":"Average Beam Dose Point Equivalent Depth",
        "keyword":"AverageBeamDosePointEquivalentDepth",
        "vr":"FL",
        "vm":"1",
        "retired":true
    },
    "300A008F":{
        "tag":"(300A,008F)",
        "name":"Average Beam Dose Point SSD",
        "keyword":"AverageBeamDosePointSSD",
        "vr":"FL",
        "vm":"1",
        "retired":true
    },
    "300A0090":{
        "tag":"(300A,0090)",
        "name":"Beam Dose Type",
        "keyword":"BeamDoseType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0091":{
        "tag":"(300A,0091)",
        "name":"Alternate Beam Dose",
        "keyword":"AlternateBeamDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0092":{
        "tag":"(300A,0092)",
        "name":"Alternate Beam Dose Type",
        "keyword":"AlternateBeamDoseType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0093":{
        "tag":"(300A,0093)",
        "name":"Depth Value Averaging Flag",
        "keyword":"DepthValueAveragingFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00A0":{
        "tag":"(300A,00A0)",
        "name":"Number of Brachy Application Setups",
        "keyword":"NumberOfBrachyApplicationSetups",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00A2":{
        "tag":"(300A,00A2)",
        "name":"Brachy Application Setup Dose Specification Point",
        "keyword":"BrachyApplicationSetupDoseSpecificationPoint",
        "vr":"DS",
        "vm":"3",
        "retired":false
    },
    "300A00A4":{
        "tag":"(300A,00A4)",
        "name":"Brachy Application Setup Dose",
        "keyword":"BrachyApplicationSetupDose",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A00B0":{
        "tag":"(300A,00B0)",
        "name":"Beam Sequence",
        "keyword":"BeamSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A00B2":{
        "tag":"(300A,00B2)",
        "name":"Treatment Machine Name",
        "keyword":"TreatmentMachineName",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A00B3":{
        "tag":"(300A,00B3)",
        "name":"Primary Dosimeter Unit",
        "keyword":"PrimaryDosimeterUnit",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00B4":{
        "tag":"(300A,00B4)",
        "name":"Source-Axis Distance",
        "keyword":"SourceAxisDistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A00B6":{
        "tag":"(300A,00B6)",
        "name":"Beam Limiting Device Sequence",
        "keyword":"BeamLimitingDeviceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A00B8":{
        "tag":"(300A,00B8)",
        "name":"RT Beam Limiting Device Type",
        "keyword":"RTBeamLimitingDeviceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00BA":{
        "tag":"(300A,00BA)",
        "name":"Source to Beam Limiting Device Distance",
        "keyword":"SourceToBeamLimitingDeviceDistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A00BB":{
        "tag":"(300A,00BB)",
        "name":"Isocenter to Beam Limiting Device Distance",
        "keyword":"IsocenterToBeamLimitingDeviceDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A00BC":{
        "tag":"(300A,00BC)",
        "name":"Number of Leaf/Jaw Pairs",
        "keyword":"NumberOfLeafJawPairs",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00BE":{
        "tag":"(300A,00BE)",
        "name":"Leaf Position Boundaries",
        "keyword":"LeafPositionBoundaries",
        "vr":"DS",
        "vm":"3-n",
        "retired":false
    },
    "300A00C0":{
        "tag":"(300A,00C0)",
        "name":"Beam Number",
        "keyword":"BeamNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00C2":{
        "tag":"(300A,00C2)",
        "name":"Beam Name",
        "keyword":"BeamName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A00C3":{
        "tag":"(300A,00C3)",
        "name":"Beam Description",
        "keyword":"BeamDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300A00C4":{
        "tag":"(300A,00C4)",
        "name":"Beam Type",
        "keyword":"BeamType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00C5":{
        "tag":"(300A,00C5)",
        "name":"Beam Delivery Duration Limit",
        "keyword":"BeamDeliveryDurationLimit",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "300A00C6":{
        "tag":"(300A,00C6)",
        "name":"Radiation Type",
        "keyword":"RadiationType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00C7":{
        "tag":"(300A,00C7)",
        "name":"High-Dose Technique Type",
        "keyword":"HighDoseTechniqueType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00C8":{
        "tag":"(300A,00C8)",
        "name":"Reference Image Number",
        "keyword":"ReferenceImageNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00CA":{
        "tag":"(300A,00CA)",
        "name":"Planned Verification Image Sequence",
        "keyword":"PlannedVerificationImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A00CC":{
        "tag":"(300A,00CC)",
        "name":"Imaging Device-Specific Acquisition Parameters",
        "keyword":"ImagingDeviceSpecificAcquisitionParameters",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "300A00CE":{
        "tag":"(300A,00CE)",
        "name":"Treatment Delivery Type",
        "keyword":"TreatmentDeliveryType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00D0":{
        "tag":"(300A,00D0)",
        "name":"Number of Wedges",
        "keyword":"NumberOfWedges",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00D1":{
        "tag":"(300A,00D1)",
        "name":"Wedge Sequence",
        "keyword":"WedgeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A00D2":{
        "tag":"(300A,00D2)",
        "name":"Wedge Number",
        "keyword":"WedgeNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00D3":{
        "tag":"(300A,00D3)",
        "name":"Wedge Type",
        "keyword":"WedgeType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00D4":{
        "tag":"(300A,00D4)",
        "name":"Wedge ID",
        "keyword":"WedgeID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A00D5":{
        "tag":"(300A,00D5)",
        "name":"Wedge Angle",
        "keyword":"WedgeAngle",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00D6":{
        "tag":"(300A,00D6)",
        "name":"Wedge Factor",
        "keyword":"WedgeFactor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A00D7":{
        "tag":"(300A,00D7)",
        "name":"Total Wedge Tray Water-Equivalent Thickness",
        "keyword":"TotalWedgeTrayWaterEquivalentThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A00D8":{
        "tag":"(300A,00D8)",
        "name":"Wedge Orientation",
        "keyword":"WedgeOrientation",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A00D9":{
        "tag":"(300A,00D9)",
        "name":"Isocenter to Wedge Tray Distance",
        "keyword":"IsocenterToWedgeTrayDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A00DA":{
        "tag":"(300A,00DA)",
        "name":"Source to Wedge Tray Distance",
        "keyword":"SourceToWedgeTrayDistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A00DB":{
        "tag":"(300A,00DB)",
        "name":"Wedge Thin Edge Position",
        "keyword":"WedgeThinEdgePosition",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A00DC":{
        "tag":"(300A,00DC)",
        "name":"Bolus ID",
        "keyword":"BolusID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A00DD":{
        "tag":"(300A,00DD)",
        "name":"Bolus Description",
        "keyword":"BolusDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300A00DE":{
        "tag":"(300A,00DE)",
        "name":"Effective Wedge Angle",
        "keyword":"EffectiveWedgeAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A00E0":{
        "tag":"(300A,00E0)",
        "name":"Number of Compensators",
        "keyword":"NumberOfCompensators",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00E1":{
        "tag":"(300A,00E1)",
        "name":"Material ID",
        "keyword":"MaterialID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A00E2":{
        "tag":"(300A,00E2)",
        "name":"Total Compensator Tray Factor",
        "keyword":"TotalCompensatorTrayFactor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A00E3":{
        "tag":"(300A,00E3)",
        "name":"Compensator Sequence",
        "keyword":"CompensatorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A00E4":{
        "tag":"(300A,00E4)",
        "name":"Compensator Number",
        "keyword":"CompensatorNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00E5":{
        "tag":"(300A,00E5)",
        "name":"Compensator ID",
        "keyword":"CompensatorID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A00E6":{
        "tag":"(300A,00E6)",
        "name":"Source to Compensator Tray Distance",
        "keyword":"SourceToCompensatorTrayDistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A00E7":{
        "tag":"(300A,00E7)",
        "name":"Compensator Rows",
        "keyword":"CompensatorRows",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00E8":{
        "tag":"(300A,00E8)",
        "name":"Compensator Columns",
        "keyword":"CompensatorColumns",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00E9":{
        "tag":"(300A,00E9)",
        "name":"Compensator Pixel Spacing",
        "keyword":"CompensatorPixelSpacing",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "300A00EA":{
        "tag":"(300A,00EA)",
        "name":"Compensator Position",
        "keyword":"CompensatorPosition",
        "vr":"DS",
        "vm":"2",
        "retired":false
    },
    "300A00EB":{
        "tag":"(300A,00EB)",
        "name":"Compensator Transmission Data",
        "keyword":"CompensatorTransmissionData",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "300A00EC":{
        "tag":"(300A,00EC)",
        "name":"Compensator Thickness Data",
        "keyword":"CompensatorThicknessData",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "300A00ED":{
        "tag":"(300A,00ED)",
        "name":"Number of Boli",
        "keyword":"NumberOfBoli",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00EE":{
        "tag":"(300A,00EE)",
        "name":"Compensator Type",
        "keyword":"CompensatorType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00EF":{
        "tag":"(300A,00EF)",
        "name":"Compensator Tray ID",
        "keyword":"CompensatorTrayID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A00F0":{
        "tag":"(300A,00F0)",
        "name":"Number of Blocks",
        "keyword":"NumberOfBlocks",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00F2":{
        "tag":"(300A,00F2)",
        "name":"Total Block Tray Factor",
        "keyword":"TotalBlockTrayFactor",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A00F3":{
        "tag":"(300A,00F3)",
        "name":"Total Block Tray Water-Equivalent Thickness",
        "keyword":"TotalBlockTrayWaterEquivalentThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A00F4":{
        "tag":"(300A,00F4)",
        "name":"Block Sequence",
        "keyword":"BlockSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A00F5":{
        "tag":"(300A,00F5)",
        "name":"Block Tray ID",
        "keyword":"BlockTrayID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A00F6":{
        "tag":"(300A,00F6)",
        "name":"Source to Block Tray Distance",
        "keyword":"SourceToBlockTrayDistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A00F7":{
        "tag":"(300A,00F7)",
        "name":"Isocenter to Block Tray Distance",
        "keyword":"IsocenterToBlockTrayDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A00F8":{
        "tag":"(300A,00F8)",
        "name":"Block Type",
        "keyword":"BlockType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00F9":{
        "tag":"(300A,00F9)",
        "name":"Accessory Code",
        "keyword":"AccessoryCode",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A00FA":{
        "tag":"(300A,00FA)",
        "name":"Block Divergence",
        "keyword":"BlockDivergence",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00FB":{
        "tag":"(300A,00FB)",
        "name":"Block Mounting Position",
        "keyword":"BlockMountingPosition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A00FC":{
        "tag":"(300A,00FC)",
        "name":"Block Number",
        "keyword":"BlockNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A00FE":{
        "tag":"(300A,00FE)",
        "name":"Block Name",
        "keyword":"BlockName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0100":{
        "tag":"(300A,0100)",
        "name":"Block Thickness",
        "keyword":"BlockThickness",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0102":{
        "tag":"(300A,0102)",
        "name":"Block Transmission",
        "keyword":"BlockTransmission",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0104":{
        "tag":"(300A,0104)",
        "name":"Block Number of Points",
        "keyword":"BlockNumberOfPoints",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0106":{
        "tag":"(300A,0106)",
        "name":"Block Data",
        "keyword":"BlockData",
        "vr":"DS",
        "vm":"2-2n",
        "retired":false
    },
    "300A0107":{
        "tag":"(300A,0107)",
        "name":"Applicator Sequence",
        "keyword":"ApplicatorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0108":{
        "tag":"(300A,0108)",
        "name":"Applicator ID",
        "keyword":"ApplicatorID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0109":{
        "tag":"(300A,0109)",
        "name":"Applicator Type",
        "keyword":"ApplicatorType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A010A":{
        "tag":"(300A,010A)",
        "name":"Applicator Description",
        "keyword":"ApplicatorDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A010C":{
        "tag":"(300A,010C)",
        "name":"Cumulative Dose Reference Coefficient",
        "keyword":"CumulativeDoseReferenceCoefficient",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A010E":{
        "tag":"(300A,010E)",
        "name":"Final Cumulative Meterset Weight",
        "keyword":"FinalCumulativeMetersetWeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0110":{
        "tag":"(300A,0110)",
        "name":"Number of Control Points",
        "keyword":"NumberOfControlPoints",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0111":{
        "tag":"(300A,0111)",
        "name":"Control Point Sequence",
        "keyword":"ControlPointSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0112":{
        "tag":"(300A,0112)",
        "name":"Control Point Index",
        "keyword":"ControlPointIndex",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0114":{
        "tag":"(300A,0114)",
        "name":"Nominal Beam Energy",
        "keyword":"NominalBeamEnergy",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0115":{
        "tag":"(300A,0115)",
        "name":"Dose Rate Set",
        "keyword":"DoseRateSet",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0116":{
        "tag":"(300A,0116)",
        "name":"Wedge Position Sequence",
        "keyword":"WedgePositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0118":{
        "tag":"(300A,0118)",
        "name":"Wedge Position",
        "keyword":"WedgePosition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A011A":{
        "tag":"(300A,011A)",
        "name":"Beam Limiting Device Position Sequence",
        "keyword":"BeamLimitingDevicePositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A011C":{
        "tag":"(300A,011C)",
        "name":"Leaf/Jaw Positions",
        "keyword":"LeafJawPositions",
        "vr":"DS",
        "vm":"2-2n",
        "retired":false
    },
    "300A011E":{
        "tag":"(300A,011E)",
        "name":"Gantry Angle",
        "keyword":"GantryAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A011F":{
        "tag":"(300A,011F)",
        "name":"Gantry Rotation Direction",
        "keyword":"GantryRotationDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0120":{
        "tag":"(300A,0120)",
        "name":"Beam Limiting Device Angle",
        "keyword":"BeamLimitingDeviceAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0121":{
        "tag":"(300A,0121)",
        "name":"Beam Limiting Device Rotation Direction",
        "keyword":"BeamLimitingDeviceRotationDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0122":{
        "tag":"(300A,0122)",
        "name":"Patient Support Angle",
        "keyword":"PatientSupportAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0123":{
        "tag":"(300A,0123)",
        "name":"Patient Support Rotation Direction",
        "keyword":"PatientSupportRotationDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0124":{
        "tag":"(300A,0124)",
        "name":"Table Top Eccentric Axis Distance",
        "keyword":"TableTopEccentricAxisDistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0125":{
        "tag":"(300A,0125)",
        "name":"Table Top Eccentric Angle",
        "keyword":"TableTopEccentricAngle",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0126":{
        "tag":"(300A,0126)",
        "name":"Table Top Eccentric Rotation Direction",
        "keyword":"TableTopEccentricRotationDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0128":{
        "tag":"(300A,0128)",
        "name":"Table Top Vertical Position",
        "keyword":"TableTopVerticalPosition",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0129":{
        "tag":"(300A,0129)",
        "name":"Table Top Longitudinal Position",
        "keyword":"TableTopLongitudinalPosition",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A012A":{
        "tag":"(300A,012A)",
        "name":"Table Top Lateral Position",
        "keyword":"TableTopLateralPosition",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A012C":{
        "tag":"(300A,012C)",
        "name":"Isocenter Position",
        "keyword":"IsocenterPosition",
        "vr":"DS",
        "vm":"3",
        "retired":false
    },
    "300A012E":{
        "tag":"(300A,012E)",
        "name":"Surface Entry Point",
        "keyword":"SurfaceEntryPoint",
        "vr":"DS",
        "vm":"3",
        "retired":false
    },
    "300A0130":{
        "tag":"(300A,0130)",
        "name":"Source to Surface Distance",
        "keyword":"SourceToSurfaceDistance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0131":{
        "tag":"(300A,0131)",
        "name":"Average Beam Dose Point Source to External Contour Distance",
        "keyword":"AverageBeamDosePointSourceToExternalContourDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0132":{
        "tag":"(300A,0132)",
        "name":"Source to External Contour Distance",
        "keyword":"SourceToExternalContourDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0133":{
        "tag":"(300A,0133)",
        "name":"External Contour Entry Point",
        "keyword":"ExternalContourEntryPoint",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "300A0134":{
        "tag":"(300A,0134)",
        "name":"Cumulative Meterset Weight",
        "keyword":"CumulativeMetersetWeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0140":{
        "tag":"(300A,0140)",
        "name":"Table Top Pitch Angle",
        "keyword":"TableTopPitchAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0142":{
        "tag":"(300A,0142)",
        "name":"Table Top Pitch Rotation Direction",
        "keyword":"TableTopPitchRotationDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0144":{
        "tag":"(300A,0144)",
        "name":"Table Top Roll Angle",
        "keyword":"TableTopRollAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0146":{
        "tag":"(300A,0146)",
        "name":"Table Top Roll Rotation Direction",
        "keyword":"TableTopRollRotationDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0148":{
        "tag":"(300A,0148)",
        "name":"Head Fixation Angle",
        "keyword":"HeadFixationAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A014A":{
        "tag":"(300A,014A)",
        "name":"Gantry Pitch Angle",
        "keyword":"GantryPitchAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A014C":{
        "tag":"(300A,014C)",
        "name":"Gantry Pitch Rotation Direction",
        "keyword":"GantryPitchRotationDirection",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A014E":{
        "tag":"(300A,014E)",
        "name":"Gantry Pitch Angle Tolerance",
        "keyword":"GantryPitchAngleTolerance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0150":{
        "tag":"(300A,0150)",
        "name":"Fixation Eye",
        "keyword":"FixationEye",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0151":{
        "tag":"(300A,0151)",
        "name":"Chair Head Frame Position",
        "keyword":"ChairHeadFramePosition",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0152":{
        "tag":"(300A,0152)",
        "name":"Head Fixation Angle Tolerance",
        "keyword":"HeadFixationAngleTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0153":{
        "tag":"(300A,0153)",
        "name":"Chair Head Frame Position Tolerance",
        "keyword":"ChairHeadFramePositionTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0154":{
        "tag":"(300A,0154)",
        "name":"Fixation Light Azimuthal Angle Tolerance",
        "keyword":"FixationLightAzimuthalAngleTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0155":{
        "tag":"(300A,0155)",
        "name":"Fixation Light Polar Angle Tolerance",
        "keyword":"FixationLightPolarAngleTolerance",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0180":{
        "tag":"(300A,0180)",
        "name":"Patient Setup Sequence",
        "keyword":"PatientSetupSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0182":{
        "tag":"(300A,0182)",
        "name":"Patient Setup Number",
        "keyword":"PatientSetupNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0183":{
        "tag":"(300A,0183)",
        "name":"Patient Setup Label",
        "keyword":"PatientSetupLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0184":{
        "tag":"(300A,0184)",
        "name":"Patient Additional Position",
        "keyword":"PatientAdditionalPosition",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0190":{
        "tag":"(300A,0190)",
        "name":"Fixation Device Sequence",
        "keyword":"FixationDeviceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0192":{
        "tag":"(300A,0192)",
        "name":"Fixation Device Type",
        "keyword":"FixationDeviceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0194":{
        "tag":"(300A,0194)",
        "name":"Fixation Device Label",
        "keyword":"FixationDeviceLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0196":{
        "tag":"(300A,0196)",
        "name":"Fixation Device Description",
        "keyword":"FixationDeviceDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300A0198":{
        "tag":"(300A,0198)",
        "name":"Fixation Device Position",
        "keyword":"FixationDevicePosition",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0199":{
        "tag":"(300A,0199)",
        "name":"Fixation Device Pitch Angle",
        "keyword":"FixationDevicePitchAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A019A":{
        "tag":"(300A,019A)",
        "name":"Fixation Device Roll Angle",
        "keyword":"FixationDeviceRollAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A01A0":{
        "tag":"(300A,01A0)",
        "name":"Shielding Device Sequence",
        "keyword":"ShieldingDeviceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A01A2":{
        "tag":"(300A,01A2)",
        "name":"Shielding Device Type",
        "keyword":"ShieldingDeviceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A01A4":{
        "tag":"(300A,01A4)",
        "name":"Shielding Device Label",
        "keyword":"ShieldingDeviceLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A01A6":{
        "tag":"(300A,01A6)",
        "name":"Shielding Device Description",
        "keyword":"ShieldingDeviceDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300A01A8":{
        "tag":"(300A,01A8)",
        "name":"Shielding Device Position",
        "keyword":"ShieldingDevicePosition",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A01B0":{
        "tag":"(300A,01B0)",
        "name":"Setup Technique",
        "keyword":"SetupTechnique",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A01B2":{
        "tag":"(300A,01B2)",
        "name":"Setup Technique Description",
        "keyword":"SetupTechniqueDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300A01B4":{
        "tag":"(300A,01B4)",
        "name":"Setup Device Sequence",
        "keyword":"SetupDeviceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A01B6":{
        "tag":"(300A,01B6)",
        "name":"Setup Device Type",
        "keyword":"SetupDeviceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A01B8":{
        "tag":"(300A,01B8)",
        "name":"Setup Device Label",
        "keyword":"SetupDeviceLabel",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A01BA":{
        "tag":"(300A,01BA)",
        "name":"Setup Device Description",
        "keyword":"SetupDeviceDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300A01BC":{
        "tag":"(300A,01BC)",
        "name":"Setup Device Parameter",
        "keyword":"SetupDeviceParameter",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A01D0":{
        "tag":"(300A,01D0)",
        "name":"Setup Reference Description",
        "keyword":"SetupReferenceDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300A01D2":{
        "tag":"(300A,01D2)",
        "name":"Table Top Vertical Setup Displacement",
        "keyword":"TableTopVerticalSetupDisplacement",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A01D4":{
        "tag":"(300A,01D4)",
        "name":"Table Top Longitudinal Setup Displacement",
        "keyword":"TableTopLongitudinalSetupDisplacement",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A01D6":{
        "tag":"(300A,01D6)",
        "name":"Table Top Lateral Setup Displacement",
        "keyword":"TableTopLateralSetupDisplacement",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0200":{
        "tag":"(300A,0200)",
        "name":"Brachy Treatment Technique",
        "keyword":"BrachyTreatmentTechnique",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0202":{
        "tag":"(300A,0202)",
        "name":"Brachy Treatment Type",
        "keyword":"BrachyTreatmentType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0206":{
        "tag":"(300A,0206)",
        "name":"Treatment Machine Sequence",
        "keyword":"TreatmentMachineSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0210":{
        "tag":"(300A,0210)",
        "name":"Source Sequence",
        "keyword":"SourceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0212":{
        "tag":"(300A,0212)",
        "name":"Source Number",
        "keyword":"SourceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0214":{
        "tag":"(300A,0214)",
        "name":"Source Type",
        "keyword":"SourceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0216":{
        "tag":"(300A,0216)",
        "name":"Source Manufacturer",
        "keyword":"SourceManufacturer",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0218":{
        "tag":"(300A,0218)",
        "name":"Active Source Diameter",
        "keyword":"ActiveSourceDiameter",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A021A":{
        "tag":"(300A,021A)",
        "name":"Active Source Length",
        "keyword":"ActiveSourceLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A021B":{
        "tag":"(300A,021B)",
        "name":"Source Model ID",
        "keyword":"SourceModelID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A021C":{
        "tag":"(300A,021C)",
        "name":"Source Description",
        "keyword":"SourceDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0222":{
        "tag":"(300A,0222)",
        "name":"Source Encapsulation Nominal Thickness",
        "keyword":"SourceEncapsulationNominalThickness",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0224":{
        "tag":"(300A,0224)",
        "name":"Source Encapsulation Nominal Transmission",
        "keyword":"SourceEncapsulationNominalTransmission",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0226":{
        "tag":"(300A,0226)",
        "name":"Source Isotope Name",
        "keyword":"SourceIsotopeName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0228":{
        "tag":"(300A,0228)",
        "name":"Source Isotope Half Life",
        "keyword":"SourceIsotopeHalfLife",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0229":{
        "tag":"(300A,0229)",
        "name":"Source Strength Units",
        "keyword":"SourceStrengthUnits",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A022A":{
        "tag":"(300A,022A)",
        "name":"Reference Air Kerma Rate",
        "keyword":"ReferenceAirKermaRate",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A022B":{
        "tag":"(300A,022B)",
        "name":"Source Strength",
        "keyword":"SourceStrength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A022C":{
        "tag":"(300A,022C)",
        "name":"Source Strength Reference Date",
        "keyword":"SourceStrengthReferenceDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "300A022E":{
        "tag":"(300A,022E)",
        "name":"Source Strength Reference Time",
        "keyword":"SourceStrengthReferenceTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "300A0230":{
        "tag":"(300A,0230)",
        "name":"Application Setup Sequence",
        "keyword":"ApplicationSetupSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0232":{
        "tag":"(300A,0232)",
        "name":"Application Setup Type",
        "keyword":"ApplicationSetupType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0234":{
        "tag":"(300A,0234)",
        "name":"Application Setup Number",
        "keyword":"ApplicationSetupNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0236":{
        "tag":"(300A,0236)",
        "name":"Application Setup Name",
        "keyword":"ApplicationSetupName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0238":{
        "tag":"(300A,0238)",
        "name":"Application Setup Manufacturer",
        "keyword":"ApplicationSetupManufacturer",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0240":{
        "tag":"(300A,0240)",
        "name":"Template Number",
        "keyword":"TemplateNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0242":{
        "tag":"(300A,0242)",
        "name":"Template Type",
        "keyword":"TemplateType",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0244":{
        "tag":"(300A,0244)",
        "name":"Template Name",
        "keyword":"TemplateName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0250":{
        "tag":"(300A,0250)",
        "name":"Total Reference Air Kerma",
        "keyword":"TotalReferenceAirKerma",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0260":{
        "tag":"(300A,0260)",
        "name":"Brachy Accessory Device Sequence",
        "keyword":"BrachyAccessoryDeviceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0262":{
        "tag":"(300A,0262)",
        "name":"Brachy Accessory Device Number",
        "keyword":"BrachyAccessoryDeviceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0263":{
        "tag":"(300A,0263)",
        "name":"Brachy Accessory Device ID",
        "keyword":"BrachyAccessoryDeviceID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0264":{
        "tag":"(300A,0264)",
        "name":"Brachy Accessory Device Type",
        "keyword":"BrachyAccessoryDeviceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0266":{
        "tag":"(300A,0266)",
        "name":"Brachy Accessory Device Name",
        "keyword":"BrachyAccessoryDeviceName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A026A":{
        "tag":"(300A,026A)",
        "name":"Brachy Accessory Device Nominal Thickness",
        "keyword":"BrachyAccessoryDeviceNominalThickness",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A026C":{
        "tag":"(300A,026C)",
        "name":"Brachy Accessory Device Nominal Transmission",
        "keyword":"BrachyAccessoryDeviceNominalTransmission",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0271":{
        "tag":"(300A,0271)",
        "name":"Channel Effective Length",
        "keyword":"ChannelEffectiveLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0272":{
        "tag":"(300A,0272)",
        "name":"Channel Inner Length",
        "keyword":"ChannelInnerLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0273":{
        "tag":"(300A,0273)",
        "name":"Afterloader Channel ID",
        "keyword":"AfterloaderChannelID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0274":{
        "tag":"(300A,0274)",
        "name":"Source Applicator Tip Length",
        "keyword":"SourceApplicatorTipLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0280":{
        "tag":"(300A,0280)",
        "name":"Channel Sequence",
        "keyword":"ChannelSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0282":{
        "tag":"(300A,0282)",
        "name":"Channel Number",
        "keyword":"ChannelNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0284":{
        "tag":"(300A,0284)",
        "name":"Channel Length",
        "keyword":"ChannelLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0286":{
        "tag":"(300A,0286)",
        "name":"Channel Total Time",
        "keyword":"ChannelTotalTime",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0288":{
        "tag":"(300A,0288)",
        "name":"Source Movement Type",
        "keyword":"SourceMovementType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A028A":{
        "tag":"(300A,028A)",
        "name":"Number of Pulses",
        "keyword":"NumberOfPulses",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A028C":{
        "tag":"(300A,028C)",
        "name":"Pulse Repetition Interval",
        "keyword":"PulseRepetitionInterval",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0290":{
        "tag":"(300A,0290)",
        "name":"Source Applicator Number",
        "keyword":"SourceApplicatorNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0291":{
        "tag":"(300A,0291)",
        "name":"Source Applicator ID",
        "keyword":"SourceApplicatorID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0292":{
        "tag":"(300A,0292)",
        "name":"Source Applicator Type",
        "keyword":"SourceApplicatorType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0294":{
        "tag":"(300A,0294)",
        "name":"Source Applicator Name",
        "keyword":"SourceApplicatorName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0296":{
        "tag":"(300A,0296)",
        "name":"Source Applicator Length",
        "keyword":"SourceApplicatorLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0298":{
        "tag":"(300A,0298)",
        "name":"Source Applicator Manufacturer",
        "keyword":"SourceApplicatorManufacturer",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A029C":{
        "tag":"(300A,029C)",
        "name":"Source Applicator Wall Nominal Thickness",
        "keyword":"SourceApplicatorWallNominalThickness",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A029E":{
        "tag":"(300A,029E)",
        "name":"Source Applicator Wall Nominal Transmission",
        "keyword":"SourceApplicatorWallNominalTransmission",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A02A0":{
        "tag":"(300A,02A0)",
        "name":"Source Applicator Step Size",
        "keyword":"SourceApplicatorStepSize",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A02A2":{
        "tag":"(300A,02A2)",
        "name":"Transfer Tube Number",
        "keyword":"TransferTubeNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A02A4":{
        "tag":"(300A,02A4)",
        "name":"Transfer Tube Length",
        "keyword":"TransferTubeLength",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A02B0":{
        "tag":"(300A,02B0)",
        "name":"Channel Shield Sequence",
        "keyword":"ChannelShieldSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A02B2":{
        "tag":"(300A,02B2)",
        "name":"Channel Shield Number",
        "keyword":"ChannelShieldNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A02B3":{
        "tag":"(300A,02B3)",
        "name":"Channel Shield ID",
        "keyword":"ChannelShieldID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A02B4":{
        "tag":"(300A,02B4)",
        "name":"Channel Shield Name",
        "keyword":"ChannelShieldName",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A02B8":{
        "tag":"(300A,02B8)",
        "name":"Channel Shield Nominal Thickness",
        "keyword":"ChannelShieldNominalThickness",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A02BA":{
        "tag":"(300A,02BA)",
        "name":"Channel Shield Nominal Transmission",
        "keyword":"ChannelShieldNominalTransmission",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A02C8":{
        "tag":"(300A,02C8)",
        "name":"Final Cumulative Time Weight",
        "keyword":"FinalCumulativeTimeWeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A02D0":{
        "tag":"(300A,02D0)",
        "name":"Brachy Control Point Sequence",
        "keyword":"BrachyControlPointSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A02D2":{
        "tag":"(300A,02D2)",
        "name":"Control Point Relative Position",
        "keyword":"ControlPointRelativePosition",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A02D4":{
        "tag":"(300A,02D4)",
        "name":"Control Point 3D Position",
        "keyword":"ControlPoint3DPosition",
        "vr":"DS",
        "vm":"3",
        "retired":false
    },
    "300A02D6":{
        "tag":"(300A,02D6)",
        "name":"Cumulative Time Weight",
        "keyword":"CumulativeTimeWeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A02E0":{
        "tag":"(300A,02E0)",
        "name":"Compensator Divergence",
        "keyword":"CompensatorDivergence",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A02E1":{
        "tag":"(300A,02E1)",
        "name":"Compensator Mounting Position",
        "keyword":"CompensatorMountingPosition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A02E2":{
        "tag":"(300A,02E2)",
        "name":"Source to Compensator Distance",
        "keyword":"SourceToCompensatorDistance",
        "vr":"DS",
        "vm":"1-n",
        "retired":false
    },
    "300A02E3":{
        "tag":"(300A,02E3)",
        "name":"Total Compensator Tray Water-Equivalent Thickness",
        "keyword":"TotalCompensatorTrayWaterEquivalentThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A02E4":{
        "tag":"(300A,02E4)",
        "name":"Isocenter to Compensator Tray Distance",
        "keyword":"IsocenterToCompensatorTrayDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A02E5":{
        "tag":"(300A,02E5)",
        "name":"Compensator Column Offset",
        "keyword":"CompensatorColumnOffset",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A02E6":{
        "tag":"(300A,02E6)",
        "name":"Isocenter to Compensator Distances",
        "keyword":"IsocenterToCompensatorDistances",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "300A02E7":{
        "tag":"(300A,02E7)",
        "name":"Compensator Relative Stopping Power Ratio",
        "keyword":"CompensatorRelativeStoppingPowerRatio",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A02E8":{
        "tag":"(300A,02E8)",
        "name":"Compensator Milling Tool Diameter",
        "keyword":"CompensatorMillingToolDiameter",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A02EA":{
        "tag":"(300A,02EA)",
        "name":"Ion Range Compensator Sequence",
        "keyword":"IonRangeCompensatorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A02EB":{
        "tag":"(300A,02EB)",
        "name":"Compensator Description",
        "keyword":"CompensatorDescription",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "300A0302":{
        "tag":"(300A,0302)",
        "name":"Radiation Mass Number",
        "keyword":"RadiationMassNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0304":{
        "tag":"(300A,0304)",
        "name":"Radiation Atomic Number",
        "keyword":"RadiationAtomicNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0306":{
        "tag":"(300A,0306)",
        "name":"Radiation Charge State",
        "keyword":"RadiationChargeState",
        "vr":"SS",
        "vm":"1",
        "retired":false
    },
    "300A0308":{
        "tag":"(300A,0308)",
        "name":"Scan Mode",
        "keyword":"ScanMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0309":{
        "tag":"(300A,0309)",
        "name":"Modulated Scan Mode Type",
        "keyword":"ModulatedScanModeType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A030A":{
        "tag":"(300A,030A)",
        "name":"Virtual Source-Axis Distances",
        "keyword":"VirtualSourceAxisDistances",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "300A030C":{
        "tag":"(300A,030C)",
        "name":"Snout Sequence",
        "keyword":"SnoutSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A030D":{
        "tag":"(300A,030D)",
        "name":"Snout Position",
        "keyword":"SnoutPosition",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A030F":{
        "tag":"(300A,030F)",
        "name":"Snout ID",
        "keyword":"SnoutID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0312":{
        "tag":"(300A,0312)",
        "name":"Number of Range Shifters",
        "keyword":"NumberOfRangeShifters",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0314":{
        "tag":"(300A,0314)",
        "name":"Range Shifter Sequence",
        "keyword":"RangeShifterSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0316":{
        "tag":"(300A,0316)",
        "name":"Range Shifter Number",
        "keyword":"RangeShifterNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0318":{
        "tag":"(300A,0318)",
        "name":"Range Shifter ID",
        "keyword":"RangeShifterID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0320":{
        "tag":"(300A,0320)",
        "name":"Range Shifter Type",
        "keyword":"RangeShifterType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0322":{
        "tag":"(300A,0322)",
        "name":"Range Shifter Description",
        "keyword":"RangeShifterDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0330":{
        "tag":"(300A,0330)",
        "name":"Number of Lateral Spreading Devices",
        "keyword":"NumberOfLateralSpreadingDevices",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0332":{
        "tag":"(300A,0332)",
        "name":"Lateral Spreading Device Sequence",
        "keyword":"LateralSpreadingDeviceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0334":{
        "tag":"(300A,0334)",
        "name":"Lateral Spreading Device Number",
        "keyword":"LateralSpreadingDeviceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0336":{
        "tag":"(300A,0336)",
        "name":"Lateral Spreading Device ID",
        "keyword":"LateralSpreadingDeviceID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0338":{
        "tag":"(300A,0338)",
        "name":"Lateral Spreading Device Type",
        "keyword":"LateralSpreadingDeviceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A033A":{
        "tag":"(300A,033A)",
        "name":"Lateral Spreading Device Description",
        "keyword":"LateralSpreadingDeviceDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A033C":{
        "tag":"(300A,033C)",
        "name":"Lateral Spreading Device Water Equivalent Thickness",
        "keyword":"LateralSpreadingDeviceWaterEquivalentThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0340":{
        "tag":"(300A,0340)",
        "name":"Number of Range Modulators",
        "keyword":"NumberOfRangeModulators",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0342":{
        "tag":"(300A,0342)",
        "name":"Range Modulator Sequence",
        "keyword":"RangeModulatorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0344":{
        "tag":"(300A,0344)",
        "name":"Range Modulator Number",
        "keyword":"RangeModulatorNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0346":{
        "tag":"(300A,0346)",
        "name":"Range Modulator ID",
        "keyword":"RangeModulatorID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0348":{
        "tag":"(300A,0348)",
        "name":"Range Modulator Type",
        "keyword":"RangeModulatorType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A034A":{
        "tag":"(300A,034A)",
        "name":"Range Modulator Description",
        "keyword":"RangeModulatorDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A034C":{
        "tag":"(300A,034C)",
        "name":"Beam Current Modulation ID",
        "keyword":"BeamCurrentModulationID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0350":{
        "tag":"(300A,0350)",
        "name":"Patient Support Type",
        "keyword":"PatientSupportType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0352":{
        "tag":"(300A,0352)",
        "name":"Patient Support ID",
        "keyword":"PatientSupportID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0354":{
        "tag":"(300A,0354)",
        "name":"Patient Support Accessory Code",
        "keyword":"PatientSupportAccessoryCode",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0355":{
        "tag":"(300A,0355)",
        "name":"Tray Accessory Code",
        "keyword":"TrayAccessoryCode",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0356":{
        "tag":"(300A,0356)",
        "name":"Fixation Light Azimuthal Angle",
        "keyword":"FixationLightAzimuthalAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0358":{
        "tag":"(300A,0358)",
        "name":"Fixation Light Polar Angle",
        "keyword":"FixationLightPolarAngle",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A035A":{
        "tag":"(300A,035A)",
        "name":"Meterset Rate",
        "keyword":"MetersetRate",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0360":{
        "tag":"(300A,0360)",
        "name":"Range Shifter Settings Sequence",
        "keyword":"RangeShifterSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0362":{
        "tag":"(300A,0362)",
        "name":"Range Shifter Setting",
        "keyword":"RangeShifterSetting",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0364":{
        "tag":"(300A,0364)",
        "name":"Isocenter to Range Shifter Distance",
        "keyword":"IsocenterToRangeShifterDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0366":{
        "tag":"(300A,0366)",
        "name":"Range Shifter Water Equivalent Thickness",
        "keyword":"RangeShifterWaterEquivalentThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0370":{
        "tag":"(300A,0370)",
        "name":"Lateral Spreading Device Settings Sequence",
        "keyword":"LateralSpreadingDeviceSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0372":{
        "tag":"(300A,0372)",
        "name":"Lateral Spreading Device Setting",
        "keyword":"LateralSpreadingDeviceSetting",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300A0374":{
        "tag":"(300A,0374)",
        "name":"Isocenter to Lateral Spreading Device Distance",
        "keyword":"IsocenterToLateralSpreadingDeviceDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0380":{
        "tag":"(300A,0380)",
        "name":"Range Modulator Settings Sequence",
        "keyword":"RangeModulatorSettingsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0382":{
        "tag":"(300A,0382)",
        "name":"Range Modulator Gating Start Value",
        "keyword":"RangeModulatorGatingStartValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0384":{
        "tag":"(300A,0384)",
        "name":"Range Modulator Gating Stop Value",
        "keyword":"RangeModulatorGatingStopValue",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0386":{
        "tag":"(300A,0386)",
        "name":"Range Modulator Gating Start Water Equivalent Thickness",
        "keyword":"RangeModulatorGatingStartWaterEquivalentThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0388":{
        "tag":"(300A,0388)",
        "name":"Range Modulator Gating Stop Water Equivalent Thickness",
        "keyword":"RangeModulatorGatingStopWaterEquivalentThickness",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A038A":{
        "tag":"(300A,038A)",
        "name":"Isocenter to Range Modulator Distance",
        "keyword":"IsocenterToRangeModulatorDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A038F":{
        "tag":"(300A,038F)",
        "name":"Scan Spot Time Offset",
        "keyword":"ScanSpotTimeOffset",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "300A0390":{
        "tag":"(300A,0390)",
        "name":"Scan Spot Tune ID",
        "keyword":"ScanSpotTuneID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0391":{
        "tag":"(300A,0391)",
        "name":"Scan Spot Prescribed Indices",
        "keyword":"ScanSpotPrescribedIndices",
        "vr":"IS",
        "vm":"1-n",
        "retired":false
    },
    "300A0392":{
        "tag":"(300A,0392)",
        "name":"Number of Scan Spot Positions",
        "keyword":"NumberOfScanSpotPositions",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0393":{
        "tag":"(300A,0393)",
        "name":"Scan Spot Reordered",
        "keyword":"ScanSpotReordered",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0394":{
        "tag":"(300A,0394)",
        "name":"Scan Spot Position Map",
        "keyword":"ScanSpotPositionMap",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "300A0395":{
        "tag":"(300A,0395)",
        "name":"Scan Spot Reordering Allowed",
        "keyword":"ScanSpotReorderingAllowed",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0396":{
        "tag":"(300A,0396)",
        "name":"Scan Spot Meterset Weights",
        "keyword":"ScanSpotMetersetWeights",
        "vr":"FL",
        "vm":"1-n",
        "retired":false
    },
    "300A0398":{
        "tag":"(300A,0398)",
        "name":"Scanning Spot Size",
        "keyword":"ScanningSpotSize",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "300A039A":{
        "tag":"(300A,039A)",
        "name":"Number of Paintings",
        "keyword":"NumberOfPaintings",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A03A0":{
        "tag":"(300A,03A0)",
        "name":"Ion Tolerance Table Sequence",
        "keyword":"IonToleranceTableSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A03A2":{
        "tag":"(300A,03A2)",
        "name":"Ion Beam Sequence",
        "keyword":"IonBeamSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A03A4":{
        "tag":"(300A,03A4)",
        "name":"Ion Beam Limiting Device Sequence",
        "keyword":"IonBeamLimitingDeviceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A03A6":{
        "tag":"(300A,03A6)",
        "name":"Ion Block Sequence",
        "keyword":"IonBlockSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A03A8":{
        "tag":"(300A,03A8)",
        "name":"Ion Control Point Sequence",
        "keyword":"IonControlPointSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A03AA":{
        "tag":"(300A,03AA)",
        "name":"Ion Wedge Sequence",
        "keyword":"IonWedgeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A03AC":{
        "tag":"(300A,03AC)",
        "name":"Ion Wedge Position Sequence",
        "keyword":"IonWedgePositionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0401":{
        "tag":"(300A,0401)",
        "name":"Referenced Setup Image Sequence",
        "keyword":"ReferencedSetupImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0402":{
        "tag":"(300A,0402)",
        "name":"Setup Image Comment",
        "keyword":"SetupImageComment",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300A0410":{
        "tag":"(300A,0410)",
        "name":"Motion Synchronization Sequence",
        "keyword":"MotionSynchronizationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0412":{
        "tag":"(300A,0412)",
        "name":"Control Point Orientation",
        "keyword":"ControlPointOrientation",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "300A0420":{
        "tag":"(300A,0420)",
        "name":"General Accessory Sequence",
        "keyword":"GeneralAccessorySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0421":{
        "tag":"(300A,0421)",
        "name":"General Accessory ID",
        "keyword":"GeneralAccessoryID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "300A0422":{
        "tag":"(300A,0422)",
        "name":"General Accessory Description",
        "keyword":"GeneralAccessoryDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "300A0423":{
        "tag":"(300A,0423)",
        "name":"General Accessory Type",
        "keyword":"GeneralAccessoryType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0424":{
        "tag":"(300A,0424)",
        "name":"General Accessory Number",
        "keyword":"GeneralAccessoryNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0425":{
        "tag":"(300A,0425)",
        "name":"Source to General Accessory Distance",
        "keyword":"SourceToGeneralAccessoryDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0431":{
        "tag":"(300A,0431)",
        "name":"Applicator Geometry Sequence",
        "keyword":"ApplicatorGeometrySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0432":{
        "tag":"(300A,0432)",
        "name":"Applicator Aperture Shape",
        "keyword":"ApplicatorApertureShape",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0433":{
        "tag":"(300A,0433)",
        "name":"Applicator Opening",
        "keyword":"ApplicatorOpening",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0434":{
        "tag":"(300A,0434)",
        "name":"Applicator Opening X",
        "keyword":"ApplicatorOpeningX",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0435":{
        "tag":"(300A,0435)",
        "name":"Applicator Opening Y",
        "keyword":"ApplicatorOpeningY",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0436":{
        "tag":"(300A,0436)",
        "name":"Source to Applicator Mounting Position Distance",
        "keyword":"SourceToApplicatorMountingPositionDistance",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0440":{
        "tag":"(300A,0440)",
        "name":"Number of Block Slab Items",
        "keyword":"NumberOfBlockSlabItems",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300A0441":{
        "tag":"(300A,0441)",
        "name":"Block Slab Sequence",
        "keyword":"BlockSlabSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0442":{
        "tag":"(300A,0442)",
        "name":"Block Slab Thickness",
        "keyword":"BlockSlabThickness",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300A0443":{
        "tag":"(300A,0443)",
        "name":"Block Slab Number",
        "keyword":"BlockSlabNumber",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "300A0450":{
        "tag":"(300A,0450)",
        "name":"Device Motion Control Sequence",
        "keyword":"DeviceMotionControlSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0451":{
        "tag":"(300A,0451)",
        "name":"Device Motion Execution Mode",
        "keyword":"DeviceMotionExecutionMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0452":{
        "tag":"(300A,0452)",
        "name":"Device Motion Observation Mode",
        "keyword":"DeviceMotionObservationMode",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0453":{
        "tag":"(300A,0453)",
        "name":"Device Motion Parameter Code Sequence",
        "keyword":"DeviceMotionParameterCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0501":{
        "tag":"(300A,0501)",
        "name":"Distal Depth Fraction",
        "keyword":"DistalDepthFraction",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0502":{
        "tag":"(300A,0502)",
        "name":"Distal Depth",
        "keyword":"DistalDepth",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0503":{
        "tag":"(300A,0503)",
        "name":"Nominal Range Modulation Fractions",
        "keyword":"NominalRangeModulationFractions",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "300A0504":{
        "tag":"(300A,0504)",
        "name":"Nominal Range Modulated Region Depths",
        "keyword":"NominalRangeModulatedRegionDepths",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "300A0505":{
        "tag":"(300A,0505)",
        "name":"Depth Dose Parameters Sequence",
        "keyword":"DepthDoseParametersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0506":{
        "tag":"(300A,0506)",
        "name":"Delivered Depth Dose Parameters Sequence",
        "keyword":"DeliveredDepthDoseParametersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300A0507":{
        "tag":"(300A,0507)",
        "name":"Delivered Distal Depth Fraction",
        "keyword":"DeliveredDistalDepthFraction",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0508":{
        "tag":"(300A,0508)",
        "name":"Delivered Distal Depth",
        "keyword":"DeliveredDistalDepth",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "300A0509":{
        "tag":"(300A,0509)",
        "name":"Delivered Nominal Range Modulation Fractions",
        "keyword":"DeliveredNominalRangeModulationFractions",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "300A0510":{
        "tag":"(300A,0510)",
        "name":"Delivered Nominal Range Modulated Region Depths",
        "keyword":"DeliveredNominalRangeModulatedRegionDepths",
        "vr":"FL",
        "vm":"2",
        "retired":false
    },
    "300A0511":{
        "tag":"(300A,0511)",
        "name":"Delivered Reference Dose Definition",
        "keyword":"DeliveredReferenceDoseDefinition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300A0512":{
        "tag":"(300A,0512)",
        "name":"Reference Dose Definition",
        "keyword":"ReferenceDoseDefinition",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300C0002":{
        "tag":"(300C,0002)",
        "name":"Referenced RT Plan Sequence",
        "keyword":"ReferencedRTPlanSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C0004":{
        "tag":"(300C,0004)",
        "name":"Referenced Beam Sequence",
        "keyword":"ReferencedBeamSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C0006":{
        "tag":"(300C,0006)",
        "name":"Referenced Beam Number",
        "keyword":"ReferencedBeamNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C0007":{
        "tag":"(300C,0007)",
        "name":"Referenced Reference Image Number",
        "keyword":"ReferencedReferenceImageNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C0008":{
        "tag":"(300C,0008)",
        "name":"Start Cumulative Meterset Weight",
        "keyword":"StartCumulativeMetersetWeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300C0009":{
        "tag":"(300C,0009)",
        "name":"End Cumulative Meterset Weight",
        "keyword":"EndCumulativeMetersetWeight",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "300C000A":{
        "tag":"(300C,000A)",
        "name":"Referenced Brachy Application Setup Sequence",
        "keyword":"ReferencedBrachyApplicationSetupSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C000C":{
        "tag":"(300C,000C)",
        "name":"Referenced Brachy Application Setup Number",
        "keyword":"ReferencedBrachyApplicationSetupNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C000E":{
        "tag":"(300C,000E)",
        "name":"Referenced Source Number",
        "keyword":"ReferencedSourceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C0020":{
        "tag":"(300C,0020)",
        "name":"Referenced Fraction Group Sequence",
        "keyword":"ReferencedFractionGroupSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C0022":{
        "tag":"(300C,0022)",
        "name":"Referenced Fraction Group Number",
        "keyword":"ReferencedFractionGroupNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C0040":{
        "tag":"(300C,0040)",
        "name":"Referenced Verification Image Sequence",
        "keyword":"ReferencedVerificationImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C0042":{
        "tag":"(300C,0042)",
        "name":"Referenced Reference Image Sequence",
        "keyword":"ReferencedReferenceImageSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C0050":{
        "tag":"(300C,0050)",
        "name":"Referenced Dose Reference Sequence",
        "keyword":"ReferencedDoseReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C0051":{
        "tag":"(300C,0051)",
        "name":"Referenced Dose Reference Number",
        "keyword":"ReferencedDoseReferenceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C0055":{
        "tag":"(300C,0055)",
        "name":"Brachy Referenced Dose Reference Sequence",
        "keyword":"BrachyReferencedDoseReferenceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C0060":{
        "tag":"(300C,0060)",
        "name":"Referenced Structure Set Sequence",
        "keyword":"ReferencedStructureSetSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C006A":{
        "tag":"(300C,006A)",
        "name":"Referenced Patient Setup Number",
        "keyword":"ReferencedPatientSetupNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C0080":{
        "tag":"(300C,0080)",
        "name":"Referenced Dose Sequence",
        "keyword":"ReferencedDoseSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C00A0":{
        "tag":"(300C,00A0)",
        "name":"Referenced Tolerance Table Number",
        "keyword":"ReferencedToleranceTableNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C00B0":{
        "tag":"(300C,00B0)",
        "name":"Referenced Bolus Sequence",
        "keyword":"ReferencedBolusSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C00C0":{
        "tag":"(300C,00C0)",
        "name":"Referenced Wedge Number",
        "keyword":"ReferencedWedgeNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C00D0":{
        "tag":"(300C,00D0)",
        "name":"Referenced Compensator Number",
        "keyword":"ReferencedCompensatorNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C00E0":{
        "tag":"(300C,00E0)",
        "name":"Referenced Block Number",
        "keyword":"ReferencedBlockNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C00F0":{
        "tag":"(300C,00F0)",
        "name":"Referenced Control Point Index",
        "keyword":"ReferencedControlPointIndex",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C00F2":{
        "tag":"(300C,00F2)",
        "name":"Referenced Control Point Sequence",
        "keyword":"ReferencedControlPointSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C00F4":{
        "tag":"(300C,00F4)",
        "name":"Referenced Start Control Point Index",
        "keyword":"ReferencedStartControlPointIndex",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C00F6":{
        "tag":"(300C,00F6)",
        "name":"Referenced Stop Control Point Index",
        "keyword":"ReferencedStopControlPointIndex",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C0100":{
        "tag":"(300C,0100)",
        "name":"Referenced Range Shifter Number",
        "keyword":"ReferencedRangeShifterNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C0102":{
        "tag":"(300C,0102)",
        "name":"Referenced Lateral Spreading Device Number",
        "keyword":"ReferencedLateralSpreadingDeviceNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C0104":{
        "tag":"(300C,0104)",
        "name":"Referenced Range Modulator Number",
        "keyword":"ReferencedRangeModulatorNumber",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "300C0111":{
        "tag":"(300C,0111)",
        "name":"Omitted Beam Task Sequence",
        "keyword":"OmittedBeamTaskSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "300C0112":{
        "tag":"(300C,0112)",
        "name":"Reason for Omission",
        "keyword":"ReasonForOmission",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300C0113":{
        "tag":"(300C,0113)",
        "name":"Reason for Omission Description",
        "keyword":"ReasonForOmissionDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "300E0002":{
        "tag":"(300E,0002)",
        "name":"Approval Status",
        "keyword":"ApprovalStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "300E0004":{
        "tag":"(300E,0004)",
        "name":"Review Date",
        "keyword":"ReviewDate",
        "vr":"DA",
        "vm":"1",
        "retired":false
    },
    "300E0005":{
        "tag":"(300E,0005)",
        "name":"Review Time",
        "keyword":"ReviewTime",
        "vr":"TM",
        "vm":"1",
        "retired":false
    },
    "300E0008":{
        "tag":"(300E,0008)",
        "name":"Reviewer Name",
        "keyword":"ReviewerName",
        "vr":"PN",
        "vm":"1",
        "retired":false
    },
    "40000010":{
        "tag":"(4000,0010)",
        "name":"Arbitrary",
        "keyword":"Arbitrary",
        "vr":"LT",
        "vm":"1",
        "retired":true
    },
    "40004000":{
        "tag":"(4000,4000)",
        "name":"Text Comments",
        "keyword":"TextComments",
        "vr":"LT",
        "vm":"1",
        "retired":true
    },
    "40080040":{
        "tag":"(4008,0040)",
        "name":"Results ID",
        "keyword":"ResultsID",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "40080042":{
        "tag":"(4008,0042)",
        "name":"Results ID Issuer",
        "keyword":"ResultsIDIssuer",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "40080050":{
        "tag":"(4008,0050)",
        "name":"Referenced Interpretation Sequence",
        "keyword":"ReferencedInterpretationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "400800FF":{
        "tag":"(4008,00FF)",
        "name":"Report Production Status (Trial)",
        "keyword":"ReportProductionStatusTrial",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "40080100":{
        "tag":"(4008,0100)",
        "name":"Interpretation Recorded Date",
        "keyword":"InterpretationRecordedDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "40080101":{
        "tag":"(4008,0101)",
        "name":"Interpretation Recorded Time",
        "keyword":"InterpretationRecordedTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "40080102":{
        "tag":"(4008,0102)",
        "name":"Interpretation Recorder",
        "keyword":"InterpretationRecorder",
        "vr":"PN",
        "vm":"1",
        "retired":true
    },
    "40080103":{
        "tag":"(4008,0103)",
        "name":"Reference to Recorded Sound",
        "keyword":"ReferenceToRecordedSound",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "40080108":{
        "tag":"(4008,0108)",
        "name":"Interpretation Transcription Date",
        "keyword":"InterpretationTranscriptionDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "40080109":{
        "tag":"(4008,0109)",
        "name":"Interpretation Transcription Time",
        "keyword":"InterpretationTranscriptionTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "4008010A":{
        "tag":"(4008,010A)",
        "name":"Interpretation Transcriber",
        "keyword":"InterpretationTranscriber",
        "vr":"PN",
        "vm":"1",
        "retired":true
    },
    "4008010B":{
        "tag":"(4008,010B)",
        "name":"Interpretation Text",
        "keyword":"InterpretationText",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "4008010C":{
        "tag":"(4008,010C)",
        "name":"Interpretation Author",
        "keyword":"InterpretationAuthor",
        "vr":"PN",
        "vm":"1",
        "retired":true
    },
    "40080111":{
        "tag":"(4008,0111)",
        "name":"Interpretation Approver Sequence",
        "keyword":"InterpretationApproverSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "40080112":{
        "tag":"(4008,0112)",
        "name":"Interpretation Approval Date",
        "keyword":"InterpretationApprovalDate",
        "vr":"DA",
        "vm":"1",
        "retired":true
    },
    "40080113":{
        "tag":"(4008,0113)",
        "name":"Interpretation Approval Time",
        "keyword":"InterpretationApprovalTime",
        "vr":"TM",
        "vm":"1",
        "retired":true
    },
    "40080114":{
        "tag":"(4008,0114)",
        "name":"Physician Approving Interpretation",
        "keyword":"PhysicianApprovingInterpretation",
        "vr":"PN",
        "vm":"1",
        "retired":true
    },
    "40080115":{
        "tag":"(4008,0115)",
        "name":"Interpretation Diagnosis Description",
        "keyword":"InterpretationDiagnosisDescription",
        "vr":"LT",
        "vm":"1",
        "retired":true
    },
    "40080117":{
        "tag":"(4008,0117)",
        "name":"Interpretation Diagnosis Code Sequence",
        "keyword":"InterpretationDiagnosisCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "40080118":{
        "tag":"(4008,0118)",
        "name":"Results Distribution List Sequence",
        "keyword":"ResultsDistributionListSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "40080119":{
        "tag":"(4008,0119)",
        "name":"Distribution Name",
        "keyword":"DistributionName",
        "vr":"PN",
        "vm":"1",
        "retired":true
    },
    "4008011A":{
        "tag":"(4008,011A)",
        "name":"Distribution Address",
        "keyword":"DistributionAddress",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "40080200":{
        "tag":"(4008,0200)",
        "name":"Interpretation ID",
        "keyword":"InterpretationID",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "40080202":{
        "tag":"(4008,0202)",
        "name":"Interpretation ID Issuer",
        "keyword":"InterpretationIDIssuer",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "40080210":{
        "tag":"(4008,0210)",
        "name":"Interpretation Type ID",
        "keyword":"InterpretationTypeID",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "40080212":{
        "tag":"(4008,0212)",
        "name":"Interpretation Status ID",
        "keyword":"InterpretationStatusID",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "40080300":{
        "tag":"(4008,0300)",
        "name":"Impressions",
        "keyword":"Impressions",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "40084000":{
        "tag":"(4008,4000)",
        "name":"Results Comments",
        "keyword":"ResultsComments",
        "vr":"ST",
        "vm":"1",
        "retired":true
    },
    "40100001":{
        "tag":"(4010,0001)",
        "name":"Low Energy Detectors",
        "keyword":"LowEnergyDetectors",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40100002":{
        "tag":"(4010,0002)",
        "name":"High Energy Detectors",
        "keyword":"HighEnergyDetectors",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40100004":{
        "tag":"(4010,0004)",
        "name":"Detector Geometry Sequence",
        "keyword":"DetectorGeometrySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101001":{
        "tag":"(4010,1001)",
        "name":"Threat ROI Voxel Sequence",
        "keyword":"ThreatROIVoxelSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101004":{
        "tag":"(4010,1004)",
        "name":"Threat ROI Base",
        "keyword":"ThreatROIBase",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "40101005":{
        "tag":"(4010,1005)",
        "name":"Threat ROI Extents",
        "keyword":"ThreatROIExtents",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "40101006":{
        "tag":"(4010,1006)",
        "name":"Threat ROI Bitmap",
        "keyword":"ThreatROIBitmap",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "40101007":{
        "tag":"(4010,1007)",
        "name":"Route Segment ID",
        "keyword":"RouteSegmentID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "40101008":{
        "tag":"(4010,1008)",
        "name":"Gantry Type",
        "keyword":"GantryType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101009":{
        "tag":"(4010,1009)",
        "name":"OOI Owner Type",
        "keyword":"OOIOwnerType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "4010100A":{
        "tag":"(4010,100A)",
        "name":"Route Segment Sequence",
        "keyword":"RouteSegmentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101010":{
        "tag":"(4010,1010)",
        "name":"Potential Threat Object ID",
        "keyword":"PotentialThreatObjectID",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "40101011":{
        "tag":"(4010,1011)",
        "name":"Threat Sequence",
        "keyword":"ThreatSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101012":{
        "tag":"(4010,1012)",
        "name":"Threat Category",
        "keyword":"ThreatCategory",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101013":{
        "tag":"(4010,1013)",
        "name":"Threat Category Description",
        "keyword":"ThreatCategoryDescription",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "40101014":{
        "tag":"(4010,1014)",
        "name":"ATD Ability Assessment",
        "keyword":"ATDAbilityAssessment",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101015":{
        "tag":"(4010,1015)",
        "name":"ATD Assessment Flag",
        "keyword":"ATDAssessmentFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101016":{
        "tag":"(4010,1016)",
        "name":"ATD Assessment Probability",
        "keyword":"ATDAssessmentProbability",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "40101017":{
        "tag":"(4010,1017)",
        "name":"Mass",
        "keyword":"Mass",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "40101018":{
        "tag":"(4010,1018)",
        "name":"Density",
        "keyword":"Density",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "40101019":{
        "tag":"(4010,1019)",
        "name":"Z Effective",
        "keyword":"ZEffective",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "4010101A":{
        "tag":"(4010,101A)",
        "name":"Boarding Pass ID",
        "keyword":"BoardingPassID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "4010101B":{
        "tag":"(4010,101B)",
        "name":"Center of Mass",
        "keyword":"CenterOfMass",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "4010101C":{
        "tag":"(4010,101C)",
        "name":"Center of PTO",
        "keyword":"CenterOfPTO",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "4010101D":{
        "tag":"(4010,101D)",
        "name":"Bounding Polygon",
        "keyword":"BoundingPolygon",
        "vr":"FL",
        "vm":"6-n",
        "retired":false
    },
    "4010101E":{
        "tag":"(4010,101E)",
        "name":"Route Segment Start Location ID",
        "keyword":"RouteSegmentStartLocationID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "4010101F":{
        "tag":"(4010,101F)",
        "name":"Route Segment End Location ID",
        "keyword":"RouteSegmentEndLocationID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "40101020":{
        "tag":"(4010,1020)",
        "name":"Route Segment Location ID Type",
        "keyword":"RouteSegmentLocationIDType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101021":{
        "tag":"(4010,1021)",
        "name":"Abort Reason",
        "keyword":"AbortReason",
        "vr":"CS",
        "vm":"1-n",
        "retired":false
    },
    "40101023":{
        "tag":"(4010,1023)",
        "name":"Volume of PTO",
        "keyword":"VolumeOfPTO",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "40101024":{
        "tag":"(4010,1024)",
        "name":"Abort Flag",
        "keyword":"AbortFlag",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101025":{
        "tag":"(4010,1025)",
        "name":"Route Segment Start Time",
        "keyword":"RouteSegmentStartTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "40101026":{
        "tag":"(4010,1026)",
        "name":"Route Segment End Time",
        "keyword":"RouteSegmentEndTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "40101027":{
        "tag":"(4010,1027)",
        "name":"TDR Type",
        "keyword":"TDRType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101028":{
        "tag":"(4010,1028)",
        "name":"International Route Segment",
        "keyword":"InternationalRouteSegment",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101029":{
        "tag":"(4010,1029)",
        "name":"Threat Detection Algorithm and Version",
        "keyword":"ThreatDetectionAlgorithmandVersion",
        "vr":"LO",
        "vm":"1-n",
        "retired":false
    },
    "4010102A":{
        "tag":"(4010,102A)",
        "name":"Assigned Location",
        "keyword":"AssignedLocation",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "4010102B":{
        "tag":"(4010,102B)",
        "name":"Alarm Decision Time",
        "keyword":"AlarmDecisionTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "40101031":{
        "tag":"(4010,1031)",
        "name":"Alarm Decision",
        "keyword":"AlarmDecision",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101033":{
        "tag":"(4010,1033)",
        "name":"Number of Total Objects",
        "keyword":"NumberOfTotalObjects",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "40101034":{
        "tag":"(4010,1034)",
        "name":"Number of Alarm Objects",
        "keyword":"NumberOfAlarmObjects",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "40101037":{
        "tag":"(4010,1037)",
        "name":"PTO Representation Sequence",
        "keyword":"PTORepresentationSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101038":{
        "tag":"(4010,1038)",
        "name":"ATD Assessment Sequence",
        "keyword":"ATDAssessmentSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101039":{
        "tag":"(4010,1039)",
        "name":"TIP Type",
        "keyword":"TIPType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "4010103A":{
        "tag":"(4010,103A)",
        "name":"DICOS Version",
        "keyword":"DICOSVersion",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101041":{
        "tag":"(4010,1041)",
        "name":"OOI Owner Creation Time",
        "keyword":"OOIOwnerCreationTime",
        "vr":"DT",
        "vm":"1",
        "retired":false
    },
    "40101042":{
        "tag":"(4010,1042)",
        "name":"OOI Type",
        "keyword":"OOIType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101043":{
        "tag":"(4010,1043)",
        "name":"OOI Size",
        "keyword":"OOISize",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "40101044":{
        "tag":"(4010,1044)",
        "name":"Acquisition Status",
        "keyword":"AcquisitionStatus",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101045":{
        "tag":"(4010,1045)",
        "name":"Basis Materials Code Sequence",
        "keyword":"BasisMaterialsCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101046":{
        "tag":"(4010,1046)",
        "name":"Phantom Type",
        "keyword":"PhantomType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101047":{
        "tag":"(4010,1047)",
        "name":"OOI Owner Sequence",
        "keyword":"OOIOwnerSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101048":{
        "tag":"(4010,1048)",
        "name":"Scan Type",
        "keyword":"ScanType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101051":{
        "tag":"(4010,1051)",
        "name":"Itinerary ID",
        "keyword":"ItineraryID",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "40101052":{
        "tag":"(4010,1052)",
        "name":"Itinerary ID Type",
        "keyword":"ItineraryIDType",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "40101053":{
        "tag":"(4010,1053)",
        "name":"Itinerary ID Assigning Authority",
        "keyword":"ItineraryIDAssigningAuthority",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "40101054":{
        "tag":"(4010,1054)",
        "name":"Route ID",
        "keyword":"RouteID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "40101055":{
        "tag":"(4010,1055)",
        "name":"Route ID Assigning Authority",
        "keyword":"RouteIDAssigningAuthority",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "40101056":{
        "tag":"(4010,1056)",
        "name":"Inbound Arrival Type",
        "keyword":"InboundArrivalType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101058":{
        "tag":"(4010,1058)",
        "name":"Carrier ID",
        "keyword":"CarrierID",
        "vr":"SH",
        "vm":"1",
        "retired":false
    },
    "40101059":{
        "tag":"(4010,1059)",
        "name":"Carrier ID Assigning Authority",
        "keyword":"CarrierIDAssigningAuthority",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101060":{
        "tag":"(4010,1060)",
        "name":"Source Orientation",
        "keyword":"SourceOrientation",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "40101061":{
        "tag":"(4010,1061)",
        "name":"Source Position",
        "keyword":"SourcePosition",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "40101062":{
        "tag":"(4010,1062)",
        "name":"Belt Height",
        "keyword":"BeltHeight",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "40101064":{
        "tag":"(4010,1064)",
        "name":"Algorithm Routing Code Sequence",
        "keyword":"AlgorithmRoutingCodeSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101067":{
        "tag":"(4010,1067)",
        "name":"Transport Classification",
        "keyword":"TransportClassification",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101068":{
        "tag":"(4010,1068)",
        "name":"OOI Type Descriptor",
        "keyword":"OOITypeDescriptor",
        "vr":"LT",
        "vm":"1",
        "retired":false
    },
    "40101069":{
        "tag":"(4010,1069)",
        "name":"Total Processing Time",
        "keyword":"TotalProcessingTime",
        "vr":"FL",
        "vm":"1",
        "retired":false
    },
    "4010106C":{
        "tag":"(4010,106C)",
        "name":"Detector Calibration Data",
        "keyword":"DetectorCalibrationData",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "4010106D":{
        "tag":"(4010,106D)",
        "name":"Additional Screening Performed",
        "keyword":"AdditionalScreeningPerformed",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "4010106E":{
        "tag":"(4010,106E)",
        "name":"Additional Inspection Selection Criteria",
        "keyword":"AdditionalInspectionSelectionCriteria",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "4010106F":{
        "tag":"(4010,106F)",
        "name":"Additional Inspection Method Sequence",
        "keyword":"AdditionalInspectionMethodSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101070":{
        "tag":"(4010,1070)",
        "name":"AIT Device Type",
        "keyword":"AITDeviceType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "40101071":{
        "tag":"(4010,1071)",
        "name":"QR Measurements Sequence",
        "keyword":"QRMeasurementsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101072":{
        "tag":"(4010,1072)",
        "name":"Target Material Sequence",
        "keyword":"TargetMaterialSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101073":{
        "tag":"(4010,1073)",
        "name":"SNR Threshold",
        "keyword":"SNRThreshold",
        "vr":"FD",
        "vm":"1",
        "retired":false
    },
    "40101075":{
        "tag":"(4010,1075)",
        "name":"Image Scale Representation",
        "keyword":"ImageScaleRepresentation",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "40101076":{
        "tag":"(4010,1076)",
        "name":"Referenced PTO Sequence",
        "keyword":"ReferencedPTOSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101077":{
        "tag":"(4010,1077)",
        "name":"Referenced TDR Instance Sequence",
        "keyword":"ReferencedTDRInstanceSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "40101078":{
        "tag":"(4010,1078)",
        "name":"PTO Location Description",
        "keyword":"PTOLocationDescription",
        "vr":"ST",
        "vm":"1",
        "retired":false
    },
    "40101079":{
        "tag":"(4010,1079)",
        "name":"Anomaly Locator Indicator Sequence",
        "keyword":"AnomalyLocatorIndicatorSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "4010107A":{
        "tag":"(4010,107A)",
        "name":"Anomaly Locator Indicator",
        "keyword":"AnomalyLocatorIndicator",
        "vr":"FL",
        "vm":"3",
        "retired":false
    },
    "4010107B":{
        "tag":"(4010,107B)",
        "name":"PTO Region Sequence",
        "keyword":"PTORegionSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "4010107C":{
        "tag":"(4010,107C)",
        "name":"Inspection Selection Criteria",
        "keyword":"InspectionSelectionCriteria",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "4010107D":{
        "tag":"(4010,107D)",
        "name":"Secondary Inspection Method Sequence",
        "keyword":"SecondaryInspectionMethodSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "4010107E":{
        "tag":"(4010,107E)",
        "name":"PRCS to RCS Orientation",
        "keyword":"PRCSToRCSOrientation",
        "vr":"DS",
        "vm":"6",
        "retired":false
    },
    "4FFE0001":{
        "tag":"(4FFE,0001)",
        "name":"MAC Parameters Sequence",
        "keyword":"MACParametersSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "50XX0005":{
        "tag":"(50XX,0005)",
        "name":"Curve Dimensions",
        "keyword":"CurveDimensions",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "50XX0010":{
        "tag":"(50XX,0010)",
        "name":"Number of Points",
        "keyword":"NumberOfPoints",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "50XX0020":{
        "tag":"(50XX,0020)",
        "name":"Type of Data",
        "keyword":"TypeOfData",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "50XX0022":{
        "tag":"(50XX,0022)",
        "name":"Curve Description",
        "keyword":"CurveDescription",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "50XX0030":{
        "tag":"(50XX,0030)",
        "name":"Axis Units",
        "keyword":"AxisUnits",
        "vr":"SH",
        "vm":"1-n",
        "retired":true
    },
    "50XX0040":{
        "tag":"(50XX,0040)",
        "name":"Axis Labels",
        "keyword":"AxisLabels",
        "vr":"SH",
        "vm":"1-n",
        "retired":true
    },
    "50XX0103":{
        "tag":"(50XX,0103)",
        "name":"Data Value Representation",
        "keyword":"DataValueRepresentation",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "50XX0104":{
        "tag":"(50XX,0104)",
        "name":"Minimum Coordinate Value",
        "keyword":"MinimumCoordinateValue",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "50XX0105":{
        "tag":"(50XX,0105)",
        "name":"Maximum Coordinate Value",
        "keyword":"MaximumCoordinateValue",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "50XX0106":{
        "tag":"(50XX,0106)",
        "name":"Curve Range",
        "keyword":"CurveRange",
        "vr":"SH",
        "vm":"1-n",
        "retired":true
    },
    "50XX0110":{
        "tag":"(50XX,0110)",
        "name":"Curve Data Descriptor",
        "keyword":"CurveDataDescriptor",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "50XX0112":{
        "tag":"(50XX,0112)",
        "name":"Coordinate Start Value",
        "keyword":"CoordinateStartValue",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "50XX0114":{
        "tag":"(50XX,0114)",
        "name":"Coordinate Step Value",
        "keyword":"CoordinateStepValue",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "50XX1001":{
        "tag":"(50XX,1001)",
        "name":"Curve Activation Layer",
        "keyword":"CurveActivationLayer",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "50XX2000":{
        "tag":"(50XX,2000)",
        "name":"Audio Type",
        "keyword":"AudioType",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "50XX2002":{
        "tag":"(50XX,2002)",
        "name":"Audio Sample Format",
        "keyword":"AudioSampleFormat",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "50XX2004":{
        "tag":"(50XX,2004)",
        "name":"Number of Channels",
        "keyword":"NumberOfChannels",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "50XX2006":{
        "tag":"(50XX,2006)",
        "name":"Number of Samples",
        "keyword":"NumberOfSamples",
        "vr":"UL",
        "vm":"1",
        "retired":true
    },
    "50XX2008":{
        "tag":"(50XX,2008)",
        "name":"Sample Rate",
        "keyword":"SampleRate",
        "vr":"UL",
        "vm":"1",
        "retired":true
    },
    "50XX200A":{
        "tag":"(50XX,200A)",
        "name":"Total Time",
        "keyword":"TotalTime",
        "vr":"UL",
        "vm":"1",
        "retired":true
    },
    "50XX200C":{
        "tag":"(50XX,200C)",
        "name":"Audio Sample Data",
        "keyword":"AudioSampleData",
        "vr":"OB or OW",
        "vm":"1",
        "retired":true
    },
    "50XX200E":{
        "tag":"(50XX,200E)",
        "name":"Audio Comments",
        "keyword":"AudioComments",
        "vr":"LT",
        "vm":"1",
        "retired":true
    },
    "50XX2500":{
        "tag":"(50XX,2500)",
        "name":"Curve Label",
        "keyword":"CurveLabel",
        "vr":"LO",
        "vm":"1",
        "retired":true
    },
    "50XX2600":{
        "tag":"(50XX,2600)",
        "name":"Curve Referenced Overlay Sequence",
        "keyword":"CurveReferencedOverlaySequence",
        "vr":"SQ",
        "vm":"1",
        "retired":true
    },
    "50XX2610":{
        "tag":"(50XX,2610)",
        "name":"Curve Referenced Overlay Group",
        "keyword":"CurveReferencedOverlayGroup",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "50XX3000":{
        "tag":"(50XX,3000)",
        "name":"Curve Data",
        "keyword":"CurveData",
        "vr":"OB or OW",
        "vm":"1",
        "retired":true
    },
    "52009229":{
        "tag":"(5200,9229)",
        "name":"Shared Functional Groups Sequence",
        "keyword":"SharedFunctionalGroupsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "52009230":{
        "tag":"(5200,9230)",
        "name":"Per-frame Functional Groups Sequence",
        "keyword":"PerFrameFunctionalGroupsSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "54000100":{
        "tag":"(5400,0100)",
        "name":"Waveform Sequence",
        "keyword":"WaveformSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "54000110":{
        "tag":"(5400,0110)",
        "name":"Channel Minimum Value",
        "keyword":"ChannelMinimumValue",
        "vr":"OB or OW",
        "vm":"1",
        "retired":false
    },
    "54000112":{
        "tag":"(5400,0112)",
        "name":"Channel Maximum Value",
        "keyword":"ChannelMaximumValue",
        "vr":"OB or OW",
        "vm":"1",
        "retired":false
    },
    "54001004":{
        "tag":"(5400,1004)",
        "name":"Waveform Bits Allocated",
        "keyword":"WaveformBitsAllocated",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "54001006":{
        "tag":"(5400,1006)",
        "name":"Waveform Sample Interpretation",
        "keyword":"WaveformSampleInterpretation",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "5400100A":{
        "tag":"(5400,100A)",
        "name":"Waveform Padding Value",
        "keyword":"WaveformPaddingValue",
        "vr":"OB or OW",
        "vm":"1",
        "retired":false
    },
    "54001010":{
        "tag":"(5400,1010)",
        "name":"Waveform Data",
        "keyword":"WaveformData",
        "vr":"OB or OW",
        "vm":"1",
        "retired":false
    },
    "56000010":{
        "tag":"(5600,0010)",
        "name":"First Order Phase Correction Angle",
        "keyword":"FirstOrderPhaseCorrectionAngle",
        "vr":"OF",
        "vm":"1",
        "retired":false
    },
    "56000020":{
        "tag":"(5600,0020)",
        "name":"Spectroscopy Data",
        "keyword":"SpectroscopyData",
        "vr":"OF",
        "vm":"1",
        "retired":false
    },
    "60XX0010":{
        "tag":"(60XX,0010)",
        "name":"Overlay Rows",
        "keyword":"OverlayRows",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "60XX0011":{
        "tag":"(60XX,0011)",
        "name":"Overlay Columns",
        "keyword":"OverlayColumns",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "60XX0012":{
        "tag":"(60XX,0012)",
        "name":"Overlay Planes",
        "keyword":"OverlayPlanes",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "60XX0015":{
        "tag":"(60XX,0015)",
        "name":"Number of Frames in Overlay",
        "keyword":"NumberOfFramesInOverlay",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "60XX0022":{
        "tag":"(60XX,0022)",
        "name":"Overlay Description",
        "keyword":"OverlayDescription",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "60XX0040":{
        "tag":"(60XX,0040)",
        "name":"Overlay Type",
        "keyword":"OverlayType",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "60XX0045":{
        "tag":"(60XX,0045)",
        "name":"Overlay Subtype",
        "keyword":"OverlaySubtype",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "60XX0050":{
        "tag":"(60XX,0050)",
        "name":"Overlay Origin",
        "keyword":"OverlayOrigin",
        "vr":"SS",
        "vm":"2",
        "retired":false
    },
    "60XX0051":{
        "tag":"(60XX,0051)",
        "name":"Image Frame Origin",
        "keyword":"ImageFrameOrigin",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "60XX0052":{
        "tag":"(60XX,0052)",
        "name":"Overlay Plane Origin",
        "keyword":"OverlayPlaneOrigin",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "60XX0060":{
        "tag":"(60XX,0060)",
        "name":"Overlay Compression Code",
        "keyword":"OverlayCompressionCode",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "60XX0061":{
        "tag":"(60XX,0061)",
        "name":"Overlay Compression Originator",
        "keyword":"OverlayCompressionOriginator",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "60XX0062":{
        "tag":"(60XX,0062)",
        "name":"Overlay Compression Label",
        "keyword":"OverlayCompressionLabel",
        "vr":"SH",
        "vm":"1",
        "retired":true
    },
    "60XX0063":{
        "tag":"(60XX,0063)",
        "name":"Overlay Compression Description",
        "keyword":"OverlayCompressionDescription",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "60XX0066":{
        "tag":"(60XX,0066)",
        "name":"Overlay Compression Step Pointers",
        "keyword":"OverlayCompressionStepPointers",
        "vr":"AT",
        "vm":"1-n",
        "retired":true
    },
    "60XX0068":{
        "tag":"(60XX,0068)",
        "name":"Overlay Repeat Interval",
        "keyword":"OverlayRepeatInterval",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "60XX0069":{
        "tag":"(60XX,0069)",
        "name":"Overlay Bits Grouped",
        "keyword":"OverlayBitsGrouped",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "60XX0100":{
        "tag":"(60XX,0100)",
        "name":"Overlay Bits Allocated",
        "keyword":"OverlayBitsAllocated",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "60XX0102":{
        "tag":"(60XX,0102)",
        "name":"Overlay Bit Position",
        "keyword":"OverlayBitPosition",
        "vr":"US",
        "vm":"1",
        "retired":false
    },
    "60XX0110":{
        "tag":"(60XX,0110)",
        "name":"Overlay Format",
        "keyword":"OverlayFormat",
        "vr":"CS",
        "vm":"1",
        "retired":true
    },
    "60XX0200":{
        "tag":"(60XX,0200)",
        "name":"Overlay Location",
        "keyword":"OverlayLocation",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "60XX0800":{
        "tag":"(60XX,0800)",
        "name":"Overlay Code Label",
        "keyword":"OverlayCodeLabel",
        "vr":"CS",
        "vm":"1-n",
        "retired":true
    },
    "60XX0802":{
        "tag":"(60XX,0802)",
        "name":"Overlay Number of Tables",
        "keyword":"OverlayNumberOfTables",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "60XX0803":{
        "tag":"(60XX,0803)",
        "name":"Overlay Code Table Location",
        "keyword":"OverlayCodeTableLocation",
        "vr":"AT",
        "vm":"1-n",
        "retired":true
    },
    "60XX0804":{
        "tag":"(60XX,0804)",
        "name":"Overlay Bits For Code Word",
        "keyword":"OverlayBitsForCodeWord",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "60XX1001":{
        "tag":"(60XX,1001)",
        "name":"Overlay Activation Layer",
        "keyword":"OverlayActivationLayer",
        "vr":"CS",
        "vm":"1",
        "retired":false
    },
    "60XX1100":{
        "tag":"(60XX,1100)",
        "name":"Overlay Descriptor - Gray",
        "keyword":"OverlayDescriptorGray",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "60XX1101":{
        "tag":"(60XX,1101)",
        "name":"Overlay Descriptor - Red",
        "keyword":"OverlayDescriptorRed",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "60XX1102":{
        "tag":"(60XX,1102)",
        "name":"Overlay Descriptor - Green",
        "keyword":"OverlayDescriptorGreen",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "60XX1103":{
        "tag":"(60XX,1103)",
        "name":"Overlay Descriptor - Blue",
        "keyword":"OverlayDescriptorBlue",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "60XX1200":{
        "tag":"(60XX,1200)",
        "name":"Overlays - Gray",
        "keyword":"OverlaysGray",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "60XX1201":{
        "tag":"(60XX,1201)",
        "name":"Overlays - Red",
        "keyword":"OverlaysRed",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "60XX1202":{
        "tag":"(60XX,1202)",
        "name":"Overlays - Green",
        "keyword":"OverlaysGreen",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "60XX1203":{
        "tag":"(60XX,1203)",
        "name":"Overlays - Blue",
        "keyword":"OverlaysBlue",
        "vr":"US",
        "vm":"1-n",
        "retired":true
    },
    "60XX1301":{
        "tag":"(60XX,1301)",
        "name":"ROI Area",
        "keyword":"ROIArea",
        "vr":"IS",
        "vm":"1",
        "retired":false
    },
    "60XX1302":{
        "tag":"(60XX,1302)",
        "name":"ROI Mean",
        "keyword":"ROIMean",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "60XX1303":{
        "tag":"(60XX,1303)",
        "name":"ROI Standard Deviation",
        "keyword":"ROIStandardDeviation",
        "vr":"DS",
        "vm":"1",
        "retired":false
    },
    "60XX1500":{
        "tag":"(60XX,1500)",
        "name":"Overlay Label",
        "keyword":"OverlayLabel",
        "vr":"LO",
        "vm":"1",
        "retired":false
    },
    "60XX3000":{
        "tag":"(60XX,3000)",
        "name":"Overlay Data",
        "keyword":"OverlayData",
        "vr":"OB or OW",
        "vm":"1",
        "retired":false
    },
    "60XX4000":{
        "tag":"(60XX,4000)",
        "name":"Overlay Comments",
        "keyword":"OverlayComments",
        "vr":"LT",
        "vm":"1",
        "retired":true
    },
    "7FE00008":{
        "tag":"(7FE0,0008)",
        "name":"Float Pixel Data",
        "keyword":"FloatPixelData",
        "vr":"OF",
        "vm":"1",
        "retired":false
    },
    "7FE00009":{
        "tag":"(7FE0,0009)",
        "name":"Double Float Pixel Data",
        "keyword":"DoubleFloatPixelData",
        "vr":"OD",
        "vm":"1",
        "retired":false
    },
    "7FE00010":{
        "tag":"(7FE0,0010)",
        "name":"Pixel Data",
        "keyword":"PixelData",
        "vr":"OB or OW",
        "vm":"1",
        "retired":false
    },
    "7FE00020":{
        "tag":"(7FE0,0020)",
        "name":"Coefficients SDVN",
        "keyword":"CoefficientsSDVN",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "7FE00030":{
        "tag":"(7FE0,0030)",
        "name":"Coefficients SDHN",
        "keyword":"CoefficientsSDHN",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "7FE00040":{
        "tag":"(7FE0,0040)",
        "name":"Coefficients SDDN",
        "keyword":"CoefficientsSDDN",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "7FXX0010":{
        "tag":"(7FXX,0010)",
        "name":"Variable Pixel Data",
        "keyword":"VariablePixelData",
        "vr":"OB or OW",
        "vm":"1",
        "retired":true
    },
    "7FXX0011":{
        "tag":"(7FXX,0011)",
        "name":"Variable Next Data Group",
        "keyword":"VariableNextDataGroup",
        "vr":"US",
        "vm":"1",
        "retired":true
    },
    "7FXX0020":{
        "tag":"(7FXX,0020)",
        "name":"Variable Coefficients SDVN",
        "keyword":"VariableCoefficientsSDVN",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "7FXX0030":{
        "tag":"(7FXX,0030)",
        "name":"Variable Coefficients SDHN",
        "keyword":"VariableCoefficientsSDHN",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "7FXX0040":{
        "tag":"(7FXX,0040)",
        "name":"Variable Coefficients SDDN",
        "keyword":"VariableCoefficientsSDDN",
        "vr":"OW",
        "vm":"1",
        "retired":true
    },
    "FFFAFFFA":{
        "tag":"(FFFA,FFFA)",
        "name":"Digital Signatures Sequence",
        "keyword":"DigitalSignaturesSequence",
        "vr":"SQ",
        "vm":"1",
        "retired":false
    },
    "FFFCFFFC":{
        "tag":"(FFFC,FFFC)",
        "name":"Data Set Trailing Padding",
        "keyword":"DataSetTrailingPadding",
        "vr":"OB",
        "vm":"1",
        "retired":false
    },
    "FFFEE000":{
        "tag":"(FFFE,E000)",
        "name":"Item",
        "keyword":"Item",
        "vr":"See Note 2",
        "vm":"1",
        "retired":false
    },
    "FFFEE00D":{
        "tag":"(FFFE,E00D)",
        "name":"Item Delimitation Item",
        "keyword":"ItemDelimitationItem",
        "vr":"See Note 2",
        "vm":"1",
        "retired":false
    },
    "FFFEE0DD":{
        "tag":"(FFFE,E0DD)",
        "name":"Sequence Delimitation Item",
        "keyword":"SequenceDelimitationItem",
        "vr":"See Note 2",
        "vm":"1",
        "retired":false
    }
};

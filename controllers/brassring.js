var querystring = require('querystring')
, http = require('http')
, xmlreader = require('xmlreader')
, StringBuilder = require("string-builder")
;

var limpiarString = function(texto, callback){

	texto = texto.replace(/[&]/g,"&amp;");
	texto = texto.replace(/[<]/g,"&lt;");
	texto = texto.replace(/[>]/g,"&gt;");
	texto = texto.replace(/[']/g,"&apos;");
	texto = texto.replace(/["]/g,"&quot;");
  return texto;
}

module.exports = {
  getReqs: function (callback) {

    var post_data = querystring.stringify({
      'inputXml' : '<?xml version="1.0" encoding="UTF-8"?><Envelope version="01.00"><Sender><Id>16</Id><Credential>25248</Credential></Sender><TransactInfo transactType="data"><TransactId>10/24/2008</TransactId><TimeStamp>12:00:00 AM</TimeStamp></TransactInfo><Unit UnitProcessor="SearchAPI"><Packet><PacketInfo packetType="data"><packetId>1</packetId></PacketInfo><Payload><InputString><ClientId>25248</ClientId><SiteId>5404</SiteId><NumberOfJobsPerPage>30</NumberOfJobsPerPage><PageNumber>1</PageNumber><OutputXMLFormat>0</OutputXMLFormat><HotJobs /><JobDescription>YES</JobDescription><DatePosted>2016/06/01</DatePosted><outputFields /><ReturnJobsCount>30</ReturnJobsCount><SelectedSearchLocaleId /></InputString></Payload></Packet></Unit></Envelope>'
    });

    var options = {
      hostname: 'import.brassring.com',
      port: 80,
      path: '/WebRouter/WebRouter.asmx/route',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        , 'Content-Length': Buffer.byteLength(post_data)
      }
    };

    var req = http.request(options, function(respuesta) {

      var body = '';
      respuesta.on('data', (d) => {
        body += d;
      }).on('end', function(){
        xmlreader.read(body, function (errXmlreader, result){
          if(!errXmlreader){
            xmlreader.read(result.string.text(), function(errReadReqsXml, reqs){
              if (!errReadReqsXml){
                //console.log("Jobs:::", reqs.Envelope.Unit.Packet.Payload.ResultSet.Jobs.Job.count());
                callback(null, reqs.Envelope.Unit.Packet.Payload.ResultSet.Jobs);
              } else {
                console.status(500).json(errReadReqsXml);
              }
            });
          } else {
            console.error("Error reading Brassring XML Body to get Jobs list ", errXmlreader);
            callback({
              "status" : 500,
              "message" : "Error reading Brassring XML Body to get Jobs list " + errXmlreader
            }, null);
          }
        });
      });
    });
    req.write(post_data);
    req.end();

    req.on('error', (e) => {
      console.error("Error getting Brassring reqs with POST: ", e);
      callback({
        "status": 500,
        "message": "Error getting Brassring reqs with POST: " + e
      }, null);
    });
  }
  , importCandidate : function(candidateXML, callback){
    var post_data = querystring.stringify({
      'CandidateXML' : candidateXML
    });

    var options = {
      hostname: 'import.brassring.com',
      port: 80,
      path: '/CandidateImport/CandidateImportService/CandidateImportService.asmx/ImportCandidateXml',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        , 'Content-Length': Buffer.byteLength(post_data)
      }
    };

    var req = http.request(options, function(respuesta) {

      var body = '';
      respuesta.on('data', (d) => {
        body += d;
      }).on('end', function(){
        //console.log("Respuesta import XML: ", body);
        xmlreader.read(body, function (errXmlreader, result){
          if(!errXmlreader){
            //console.log("XMLReader Import Response:", result.string.text());
            //callback(null, result.string.text());
            xmlreader.read(result.string.text(), function(errReadReqsXml, respuestaImport){
              if (!errReadReqsXml){
                if (respuestaImport.Envelope.Packet.PacketInfo.Status.Code.text() == "200"){
                  callback(null, "200");
                } else {
                  callback(null, respuestaImport.Envelope.Packet.PacketInfo.Status.LongDescription.text());
                }
              } else {
                console.status(500).json(errReadReqsXml);
              }
            });
          } else {
            console.error("Error reading Brassring XML Body to get Jobs list ", errXmlreader);
            callback({
              "status" : 500,
              "message" : "Error reading Brassring XML Body to get Jobs list " + errXmlreader
            }, null);
          }
        });

      });
    });
    req.write(post_data);
    req.end();

    req.on('error', (e) => {
      console.error("Error importing candidate in Brassring with POST: ", e);
      callback({
        "status": 500,
        "message": "Error importing candidate in Brassring with POST: " + e
      }, null);
    });
  }
  , buildCandidateXML : function(candidateJSON, callback){
    var candidateXML = new StringBuilder();
    try {
      candidateXML.append('<?xml version="1.0" encoding="UTF-8"?>');
      candidateXML.append('<BRpartner:Envelope version="01.00" xmlns:BRpartner="http://trm.brassring.com/brpartner">');
      candidateXML.append('<Sender>');
      candidateXML.append('<Id>16</Id>');
      candidateXML.append('<Credential>25248</Credential>');
      candidateXML.append('</Sender>');
      candidateXML.append('<Recipient>');
      candidateXML.append('<id type="email">luisfl92@hotmail.com</id>');
      //candidateXML.append('<!-- Reply email or URL where async responses are sent. Can have one or more email addresses or one URL -->');
      candidateXML.append('</Recipient>');
      candidateXML.append('<TransactInfo transactType="data">');
      candidateXML.appendFormat('<transactId>{0}</transactId>', candidateJSON.personId);
      candidateXML.appendFormat('<timeStamp>{0}</timeStamp>', Date.now().toString());
      candidateXML.append('</TransactInfo>');
      candidateXML.append('<Packet>');
      candidateXML.append('<PacketInfo packetType="data">');
      candidateXML.append('<packetId>1</packetId>');
      candidateXML.append('<Action>INSERT</Action>');
      candidateXML.append('<Manifest>RIPLEY_CANDIDATE_UPLOAD</Manifest>');
      candidateXML.append('</PacketInfo>');
      candidateXML.append('<Payload><![CDATA[<?xml version="1.0" encoding="UTF-8"?>');
      candidateXML.append('<Candidate xmlns:RHrxml="http://ns.hr-xml.org/2004-08-02" xmlns:BRpartner="http://trm.brassring.com/brpartner">');
      candidateXML.append('<CandidateRecordInfo>');
      candidateXML.append('<Id idOwner="CandidateId">');
      candidateXML.append('<IdValue/>');
      //<!-- Optional. Leaving this value empty is Ok  -->
      //<!-- Resumekey/Reference number cannot be specified for an action "INSERT" leave it blank.-->
      candidateXML.append('</Id>');
      candidateXML.append('<Status>Active</Status>');
      //<!-- Required - Indicates Candidate Status in the system. A for Active, I for Inactive -->
      candidateXML.append('</CandidateRecordInfo>');
      candidateXML.append('<CandidateSupplier relationship="x:vendor">');
      candidateXML.append('<SupplierId>');
      candidateXML.append('<IdValue>API_IMPORT</IdValue>');
      //<!-- Required - This is provided by Kenexa. Do not change this information  -->
      candidateXML.append('</SupplierId>');
      candidateXML.append('<EntityName/>');
      //<!-- Optional. Leaving this value empty is Ok  -->
      candidateXML.append('</CandidateSupplier>');
      candidateXML.append('<CandidateProfile xml:lang="EN">');
      candidateXML.append('<PersonalData>');
      candidateXML.append('<PersonName>');
      candidateXML.appendFormat('<GivenName>{0}</GivenName>', limpiarString(candidateJSON.personalInfo.firstName));
      //<!-- Required. This is the First Name of the candidate  -->
      (candidateJSON.personalInfo.middleName) ? candidateXML.appendFormat('<MiddleName>{0}</MiddleName>', limpiarString(candidateJSON.personalInfo.middleName)) : candidateXML.append('<MiddleName/>');
      //<!-- Optional. This is the Middle Name of the candidate. Leaving this value empty is Ok  -->
      candidateXML.appendFormat('<FamilyName>{0}</FamilyName>', limpiarString(candidateJSON.personalInfo.lastName));
      //<!-- Required. This is the Last Name of the candidate  -->
      candidateXML.append('</PersonName>');
      candidateXML.append('<ContactMethod>');
      candidateXML.append('<Location>home</Location>');
      //<!-- Required - Do not change this information  -->
      candidateXML.append('<Telephone>');
      candidateXML.appendFormat('<FormattedNumber>{0}</FormattedNumber>', candidateJSON.personalInfo.phoneNumbers[0].number);
      //<!--  Required. This is the Home Phone -->
      candidateXML.append('</Telephone>');
      candidateXML.append('<Fax>');
      candidateXML.append('<FormattedNumber/>');
      //<!-- Optional. This is the Fax number of the candidate. Leaving this value empty is Ok  -->
      candidateXML.append('</Fax>');
      candidateXML.appendFormat('<InternetEmailAddress>{0}</InternetEmailAddress>', limpiarString(candidateJSON.personalInfo.emails.primaryEmail));
      if (candidateJSON.personalInfo.picture){
        candidateXML.appendFormat('<InternetWebAddress>{0}</InternetWebAddress>', limpiarString(candidateJSON.personalInfo.picture));
      } else {
        candidateXML.append('<InternetWebAddress>{0}</InternetWebAddress>');
      }

      //<!--  Required. This is the Email Address -->
      candidateXML.append('<PostalAddress>');
      candidateXML.append('<CountryCode>CL</CountryCode>');
      //<!-- Optional. Leaving this value empty is Ok  -->
      if (candidateJSON.personalInfo.zipcode){
          candidateXML.appendFormat('<PostalCode>{0}</PostalCode>', candidateJSON.personalInfo.zipcode);
      } else {
        candidateXML.append('<PostalCode>NULL</PostalCode>');
      }

      //<!-- Optional. Leaving this value empty is Ok  -->
      candidateXML.appendFormat('<Region>{0}</Region>', limpiarString(candidateJSON.personalInfo.region.description));
      //<!-- Optional.  Leaving this value empty is Ok  -->
      candidateXML.appendFormat('<Municipality>{0}</Municipality>', limpiarString(candidateJSON.personalInfo.city.description));
      //<!-- Optional. Leaving this value empty is Ok  -->
      candidateXML.append('<DeliveryAddress>');
      candidateXML.appendFormat('<AddressLine>{0}</AddressLine>', limpiarString(candidateJSON.personalInfo.address));
      //<!-- Optional. Leaving this value empty is Ok  -->
      candidateXML.append('</DeliveryAddress>');
      candidateXML.append('</PostalAddress>');
      candidateXML.append('</ContactMethod>');
      candidateXML.append('</PersonalData>');

      //Employment History
      if (candidateJSON.workExperience.length > 5){
        candidateXML.append('<EmploymentHistory>');
        for (i=0; i<5; i++){
          candidateXML.append('<EmployerOrg>');
          if (candidateJSON.workExperience[i].companyName){
            candidateXML.appendFormat('<EmployerOrgName>{0}</EmployerOrgName>', limpiarString(candidateJSON.workExperience[i].companyName));
          } else {
            candidateXML.append('<EmployerOrgName>NULL</EmployerOrgName>');
          }

          candidateXML.append('<PositionHistory>');
          candidateXML.append('<OrgName>');
          if (candidateJSON.workExperience[i].companyName){
            candidateXML.appendFormat('<OrganizationName>{0}</OrganizationName>', limpiarString(candidateJSON.workExperience[i].companyName));
          } else {
            candidateXML.append('<OrganizationName>NULL</OrganizationName>');
          }

          candidateXML.append('</OrgName>');
          (candidateJSON.workExperience[i].position.description) ? candidateXML.appendFormat('<Description>{0}</Description>', limpiarString(candidateJSON.workExperience[i].position.description)) : candidateXML.append('<Description>NULL</Description>');
          candidateXML.append('<StartDate>');
          candidateXML.appendFormat('<Year>{0}</Year>', candidateJSON.workExperience[i].fromDate.split("/")[2]);
          candidateXML.append('</StartDate>');
          candidateXML.append('<EndDate>');
          (candidateJSON.workExperience[i].toDate) ? candidateXML.appendFormat('<Year>{0}</Year>', candidateJSON.workExperience[i].toDate.split("/")[2]) : candidateXML.appendFormat('<Year>{0}</Year>', new Date().getFullYear());
          candidateXML.append('</EndDate>');
          candidateXML.append('</PositionHistory>');
          candidateXML.append('</EmployerOrg>');

        }
        candidateXML.append('</EmploymentHistory>');
      } else if (candidateJSON.workExperience.length != 0) {
        candidateXML.append('<EmploymentHistory>');
        candidateJSON.workExperience.forEach(function(employment){
          candidateXML.append('<EmployerOrg>');
          if (employment.companyName){
            candidateXML.appendFormat('<EmployerOrgName>{0}</EmployerOrgName>', limpiarString(employment.companyName));
          } else {
            candidateXML.append('<EmployerOrgName>NULL</EmployerOrgName>');
          }
          candidateXML.append('<PositionHistory>');
          candidateXML.append('<OrgName>');

          if (employment.companyName){
            candidateXML.appendFormat('<OrganizationName>{0}</OrganizationName>', limpiarString(employment.companyName));
          } else {
            candidateXML.append('<OrganizationName>NULL</OrganizationName>');
          }
          candidateXML.append('</OrgName>');


          (employment.position.description) ? candidateXML.appendFormat('<Description>{0}</Description>', limpiarString(employment.position.description)) : candidateXML.append('<Description>NULL</Description>');
          candidateXML.append('<StartDate>');
          candidateXML.appendFormat('<Year>{0}</Year>', employment.fromDate.split("/")[2]);
          candidateXML.append('</StartDate>');
          candidateXML.append('<EndDate>');
          (employment.toDate) ? candidateXML.appendFormat('<Year>{0}</Year>', employment.toDate.split("/")[2]) : candidateXML.appendFormat('<Year>{0}</Year>', new Date().getFullYear());
          candidateXML.append('</EndDate>');
          candidateXML.append('</PositionHistory>');
          candidateXML.append('</EmployerOrg>');
        });
        candidateXML.append('</EmploymentHistory>');
      }

      //Education History
      if (candidateJSON.studies.primaryEducation || candidateJSON.studies.higherEducation[0]){
        candidateXML.append('<EducationHistory>');
        //Verificar si tiene universidad
        if (candidateJSON.studies.higherEducation[0]){
          candidateXML.append('<SchoolOrInstitution schoolType="university">');
          candidateXML.append('<School>');
          candidateXML.appendFormat('<SchoolName>{0}</SchoolName>', limpiarString(candidateJSON.studies.higherEducation[0].institution.name));
          //<!-- Optional. This is theEducational Institute.  Leaving this value empty is Ok  -->
          candidateXML.append('</School>');
          candidateXML.append('<Degree degreeType="bachelors">');
          candidateXML.appendFormat('<DegreeName>{0}</DegreeName>', limpiarString(candidateJSON.studies.higherEducation[0].career.name));
          //<!-- Optional. This is the Area of Study.  Leaving this value empty is Ok  -->
          candidateXML.append('<DegreeDate>');
          candidateXML.appendFormat('<Year>{0}</Year>', candidateJSON.studies.higherEducation[0].graduationyear);
          //<!-- Optional. This is the Grad Year.  Leaving this value empty is Ok  -->
          candidateXML.append('</DegreeDate>');
          candidateXML.append('</Degree>');
          candidateXML.append('</SchoolOrInstitution>');
        }
        //Verificar Colegio
        if (candidateJSON.studies.primaryEducation){
          candidateXML.append('<SchoolOrInstitution schoolType="university">');
          candidateXML.append('<School>');
          if (candidateJSON.studies.primaryEducation.school){
            candidateXML.appendFormat('<SchoolName>{0}</SchoolName>', limpiarString(candidateJSON.studies.primaryEducation.school));
          } else {
              candidateXML.append('<SchoolName>NULL</SchoolName>');
          }
          //<!-- Optional. This is theEducational Institute.  Leaving this value empty is Ok  -->
          candidateXML.append('</School>');
          candidateXML.append('<Degree degreeType="bachelors">');
          candidateXML.append('<DegreeName/>');
          //<!-- Optional. This is the Area of Study.  Leaving this value empty is Ok  -->
          candidateXML.append('<DegreeDate>');
          candidateXML.appendFormat('<Year>{0}</Year>', candidateJSON.studies.primaryEducation.promoteYear.split("/")[2]);
          //<!-- Optional. This is the Grad Year.  Leaving this value empty is Ok  -->
          candidateXML.append('</DegreeDate>');
          candidateXML.append('</Degree>');
          candidateXML.append('</SchoolOrInstitution>');
        }
        candidateXML.append('</EducationHistory>');
      }

      candidateXML.append('<UserArea>');
      candidateXML.append('<BRpartner:codes>');
      //<!--This is an Import Code. This one has to be exactly same as the vendor CandidateSupplier.SupplierId.IdValue.-->
      candidateXML.append('<BRpartner:code>API_IMPORT</BRpartner:code>');
      <!-- supplier ID Code (creado por mario) -->
      candidateXML.append('<BRpartner:code>OTHR</BRpartner:code>');
      <!-- This has to be valid Source code -->
      candidateXML.appendFormat('<BRpartner:code>{0}</BRpartner:code>', candidateJSON.brassringReqId);
      //<!-- Req Code -->
      candidateXML.append('</BRpartner:codes>');
      candidateXML.append('<BRpartner:candidatetype>External</BRpartner:candidatetype>');
      candidateXML.append('<BRpartner:coverletter/>');
      //<!-- This section indicates that candidate should be filed into a req with an HRStatus. The autoreq has to be passed also as a code -->
      candidateXML.append('</UserArea>');
      candidateXML.append('</CandidateProfile>');
      candidateXML.append('</Candidate>');
      candidateXML.append(']]></Payload>');
      candidateXML.append('</Packet>');
      candidateXML.append('</BRpartner:Envelope>');

      callback(null, candidateXML.toString());

    } catch(err) {
      console.log("ERROR!!!! catched building CandidateXML: ", err, " ----- Postulant: ", candidateJSON.personId);
      console.log("XML CON ERROR: ", candidateXML.toString());
      callback("ERROR!!!! catched building CandidateXML: " + err + " ----- Postulant: " + candidateJSON.personId, null);
    }

  }
}

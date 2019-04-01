
function formatSpecimenMetadata(metadata) {

  let containerIdentifier = metadata['00400512']['Value'][0];
  let specimenDescriptions = metadata['00400560']['Value'].map(item => {
    let specimenUID = item['00400554']['Value'][0];
    var specimenIdentifier = '';
    if ('00400551' in item) {
      specimenIdentifier = item['00400551']['Value'][0];
    }
    var specimenShortDescription = '';
    if ('00400600' in item) {
      if (item['00400600']['Value']) {
        specimenShortDescription = item['00400600']['Value'][0];
      }
    }

    var anatomicStructure = [];
    if ('00082228' in item) {
      if (item['00082228']['Value']) {
        anatomicStructure = item['00082228']['Value'].map(struct => {
          return(struct['00080104']['Value'][0]);
        });
      }
    }

    var specimenLocalization = [];
    if ('00400620' in item) {
      if (item['00400620']['Value']) {
        specimenLocalization = item['00400620']['Value'].map(loc => {
          let name = loc['0040A043']['Value'][0]['00080104']['Value'][0];
          let value = loc['0040A160']['Value'][0];
          return({name: name, value: value});
        });
      }
    }

    var specimenPreparationSteps = [];
    if ('00400610' in item) {
      if (item['00400610']['Value']) {
        specimenPreparationSteps = item['00400610']['Value'].map(step => {
          const stepDescription = [];
          for (let contentItem of step['00400612']['Value']) {
            let conceptName = contentItem['0040A043']['Value'][0];
            const conceptNameCode = conceptName['00080100']['Value'][0];
            const conceptNameMeaning = conceptName['00080104']['Value'][0];
            const contentItemType = contentItem['0040A040']['Value'][0];
            if (contentItemType == 'CODE') {
              var conceptValue = contentItem['0040A168']['Value'][0]['00080104']['Value'][0];
            } else if (contentItemType == 'TEXT') {
              var conceptValue = contentItem['0040A160']['Value'][0];
            } else if (contentItemType == 'DATETIME') {
              var conceptValue = contentItem['0040A120']['Value'][0];
            } else {
              console.error('content type not supported: ' + contentItemType);
            }
            stepDescription.push({name: conceptNameMeaning, value: conceptValue});
          }
          return(stepDescription);
        });
      }
    }

    return({
      uid: specimenUID,
      id: specimenIdentifier,
      description: specimenShortDescription,
      anatomicStructures: anatomicStructure,
      localization: specimenLocalization,
      preparationSteps: specimenPreparationSteps
    });

  });

  return({
    container: containerIdentifier,
    specimens: specimenDescriptions
  });
}

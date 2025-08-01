// This file is part of InvenioRDM
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021-2022 Graz University of Technology.
// Copyright (C) 2022-2024 KTH Royal Institute of Technology.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import React, { Component, createRef, Fragment } from "react";
import { AccordionField, CustomFields } from "react-invenio-forms";
import {
  AccessRightField,
  DescriptionsField,
  CreatibutorsField,
  DatesField,
  DeleteButton,
  DepositStatusBox,
  FileUploader,
  UppyUploader,
  FormFeedback,
  IdentifiersField,
  PIDField,
  PreviewButton,
  LanguagesField,
  LicenseField,
  PublicationDateField,
  PublishButton,
  PublisherField,
  ReferencesField,
  RelatedWorksField,
  ResourceTypeField,
  SubjectsField,
  TitlesField,
  VersionField,
  DepositFormApp,
  CommunityHeader,
  SaveButton,
} from "@js/invenio_rdm_records";
import { FundingField } from "@js/invenio_vocabularies";
import { Card, Container, Grid, Ref, Sticky } from "semantic-ui-react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { CopyrightsField } from "@js/invenio_rdm_records/src/deposit/fields/CopyrightsField/CopyrightsField";
import { ShareDraftButton } from "./ShareDraftButton";
import { depositFormSectionsConfig, severityChecksConfig } from "./config";

export class RDMDepositForm extends Component {
  constructor(props) {
    super(props);
    this.config = props.config || {};
    const { files, record } = this.props;
    // TODO: Make ALL vocabulary be generated by backend.
    // Currently, some vocabulary is generated by backend and some is
    // generated by frontend here. Iteration is faster and abstractions can be
    // discovered by generating vocabulary here. Once happy with vocabularies,
    // then we can generate it in the backend.
    this.vocabularies = {
      metadata: {
        ...this.config.vocabularies,

        creators: {
          ...this.config.vocabularies.creators,
          type: [
            { text: i18next.t("Person"), value: "personal" },
            { text: i18next.t("Organization"), value: "organizational" },
          ],
        },

        contributors: {
          ...this.config.vocabularies.contributors,
          type: [
            { text: i18next.t("Person"), value: "personal" },
            { text: i18next.t("Organization"), value: "organizational" },
          ],
        },
        identifiers: {
          ...this.config.vocabularies.identifiers,
        },
      },
    };

    // check if files are present
    this.noFiles = false;
    if (
      !Array.isArray(files.entries) ||
      (!files.entries.length && record.is_published)
    ) {
      this.noFiles = true;
    }

    this.sectionsConfig = depositFormSectionsConfig;
    this.severityChecks = severityChecksConfig;

    // hide community header for branded communities
    this.hide_community_selection = this.config.hide_community_selection || false;
  }

  formFeedbackRef = createRef();
  sidebarRef = createRef();

  render() {
    const {
      config,
      record,
      files,
      permissions,
      preselectedCommunity,
      filesLocked,
      recordRestrictionGracePeriod,
      allowRecordRestriction,
      groupsEnabled,
      allowEmptyFiles,
      useUppy,
    } = this.props;

    // Adding section id to custom fields UI, to be used for accordions
    const customFieldsUI = this.config.custom_fields.ui.map((section) => ({
      ...section,
      id: section.section.toLowerCase().replace(/\s+/g, "-") + "-section",
    }));
    const UploaderField = useUppy ? UppyUploader : FileUploader;

    return (
      <Overridable
        id="InvenioAppRdm.Deposit.RDMDepositForm.layout"
        record={record}
        files={files}
        config={config}
        permissions={permissions}
        preselectedCommunity={preselectedCommunity}
        filesLocked={filesLocked}
        recordRestrictionGracePeriod={recordRestrictionGracePeriod}
        allowRecordRestriction={allowRecordRestriction}
        groupsEnabled={groupsEnabled}
        allowEmptyFiles={allowEmptyFiles}
        customFieldsUI={customFieldsUI}
      >
        <DepositFormApp
          config={this.config}
          record={record}
          preselectedCommunity={preselectedCommunity}
          files={files}
          permissions={permissions}
          errors={record.errors}
        >
          <Overridable
            id="InvenioAppRdm.Deposit.FormFeedback.container"
            labels={this.config.custom_fields.error_labels}
            fieldPath="message"
          >
            <FormFeedback
              fieldPath="message"
              labels={this.config.custom_fields.error_labels}
              sectionsConfig={this.sectionsConfig}
            />
          </Overridable>

          <Overridable
            id="InvenioAppRdm.Deposit.CommunityHeader.container"
            record={record}
          >
            {!this.hide_community_selection && (
              <CommunityHeader
                imagePlaceholderLink="/static/images/square-placeholder.png"
                record={record}
              />
            )}
          </Overridable>
          <Container id="rdm-deposit-form" className="rel-mt-1">
            <Grid className="mt-25">
              <Grid.Column mobile={16} tablet={16} computer={11}>
                <Overridable
                  id="InvenioAppRdm.Deposit.AccordionFieldFiles.container"
                  record={record}
                  config={this.config}
                  noFiles={this.noFiles}
                >
                  <AccordionField
                    includesPaths={this.sectionsConfig["files-section"]}
                    severityChecks={this.severityChecks}
                    active
                    label={i18next.t("Files")}
                    id="files-section"
                  >
                    {this.noFiles && record.is_published && (
                      <div className="text-align-center pb-10">
                        <em>{i18next.t("The record has no files.")}</em>
                      </div>
                    )}
                    <Overridable
                      id="InvenioAppRdm.Deposit.FileUploader.container"
                      record={record}
                      config={this.config}
                      permissions={permissions}
                      filesLocked={filesLocked}
                      allowEmptyFiles={allowEmptyFiles}
                    >
                      <UploaderField
                        isDraftRecord={!record.is_published}
                        quota={this.config.quota}
                        decimalSizeDisplay={this.config.decimal_size_display}
                        showMetadataOnlyToggle={permissions?.can_manage_files}
                        allowEmptyFiles={allowEmptyFiles}
                        filesLocked={filesLocked}
                        fileUploadConcurrency={config.fileUploadConcurrency}
                      />
                    </Overridable>
                  </AccordionField>
                </Overridable>
                <Overridable
                  id="InvenioAppRdm.Deposit.AccordionFieldBasicInformation.container"
                  config={this.config}
                  record={record}
                  vocabularies={this.vocabularies}
                >
                  <AccordionField
                    includesPaths={this.sectionsConfig["basic-information-section"]}
                    severityChecks={this.severityChecks}
                    active
                    label={i18next.t("Basic information")}
                    id="basic-information-section"
                  >
                    <Overridable
                      id="InvenioAppRdm.Deposit.PIDField.container"
                      config={this.config}
                      record={record}
                    >
                      <Fragment>
                        {this.config.pids.map((pid) => (
                          <Fragment key={pid.scheme}>
                            <PIDField
                              btnLabelDiscardPID={pid.btn_label_discard_pid}
                              btnLabelGetPID={pid.btn_label_get_pid}
                              canBeManaged={pid.can_be_managed}
                              canBeUnmanaged={pid.can_be_unmanaged}
                              optionalDOItransitions={pid.optional_doi_transitions}
                              fieldPath={`pids.${pid.scheme}`}
                              fieldLabel={pid.field_label}
                              isEditingPublishedRecord={
                                record.is_published === true // is_published is `null` at first upload
                              }
                              managedHelpText={pid.managed_help_text}
                              pidLabel={pid.pid_label}
                              pidPlaceholder={pid.pid_placeholder}
                              pidType={pid.scheme}
                              unmanagedHelpText={pid.unmanaged_help_text}
                              doiDefaultSelection={pid.default_selected}
                              required={this.config.is_doi_required}
                              record={record}
                            />
                          </Fragment>
                        ))}
                      </Fragment>
                    </Overridable>

                    <Overridable
                      id="InvenioAppRdm.Deposit.ResourceTypeField.container"
                      vocabularies={this.vocabularies}
                      fieldPath="metadata.resource_type"
                    >
                      <ResourceTypeField
                        options={this.vocabularies.metadata.resource_type}
                        fieldPath="metadata.resource_type"
                        required
                      />
                    </Overridable>

                    <Overridable
                      id="InvenioAppRdm.Deposit.TitlesField.container"
                      vocabularies={this.vocabularies}
                      fieldPath="metadata.title"
                      record={record}
                    >
                      <TitlesField
                        options={this.vocabularies.metadata.titles}
                        fieldPath="metadata.title"
                        recordUI={record.ui}
                        required
                      />
                    </Overridable>

                    <Overridable
                      id="InvenioAppRdm.Deposit.PublicationDateField.container"
                      fieldPath="metadata.publication_date"
                    >
                      <PublicationDateField
                        required
                        fieldPath="metadata.publication_date"
                      />
                    </Overridable>

                    <Overridable
                      id="InvenioAppRdm.Deposit.CreatorsField.container"
                      vocabularies={this.vocabularies}
                      config={this.config}
                      fieldPath="metadata.creators"
                    >
                      <CreatibutorsField
                        label={i18next.t("Creators")}
                        labelIcon="user"
                        fieldPath="metadata.creators"
                        roleOptions={this.vocabularies.metadata.creators.role}
                        schema="creators"
                        autocompleteNames={this.config.autocomplete_names}
                        required
                      />
                    </Overridable>

                    <Overridable
                      id="InvenioAppRdm.Deposit.DescriptionsField.container"
                      record={record}
                      vocabularies={this.vocabularies}
                      fieldPath="metadata.description"
                    >
                      <DescriptionsField
                        fieldPath="metadata.description"
                        options={this.vocabularies.metadata.descriptions}
                        recordUI={_get(record, "ui", null)}
                      />
                    </Overridable>

                    <Overridable
                      id="InvenioAppRdm.Deposit.LicenseField.container"
                      fieldPath="metadata.rights"
                    >
                      <LicenseField
                        fieldPath="metadata.rights"
                        searchConfig={{
                          searchApi: {
                            axios: {
                              headers: {
                                Accept: "application/vnd.inveniordm.v1+json",
                              },
                              url: "/api/vocabularies/licenses",
                              withCredentials: false,
                            },
                          },
                          initialQueryState: {
                            filters: [["tags", "recommended"]],
                            sortBy: "bestmatch",
                            sortOrder: "asc",
                            layout: "list",
                            page: 1,
                            size: 12,
                          },
                        }}
                        serializeLicenses={(result) => ({
                          title: result.title_l10n,
                          description: result.description_l10n,
                          id: result.id,
                          link: result.props.url,
                        })}
                      />
                    </Overridable>
                    <Overridable
                      id="InvenioAppRdm.Deposit.CopyrightsField.container"
                      fieldPath="metadata.copyright"
                    >
                      <CopyrightsField fieldPath="metadata.copyright" />
                    </Overridable>
                    <Overridable
                      id="InvenioAppRdm.Deposit.AccordionFieldBasicInformation.extra"
                      record={record}
                      files={files}
                      permissions={permissions}
                      preselectedCommunity={preselectedCommunity}
                      filesLocked={filesLocked}
                      recordRestrictionGracePeriod={recordRestrictionGracePeriod}
                      allowRecordRestriction={allowRecordRestriction}
                      groupsEnabled={groupsEnabled}
                      allowEmptyFiles={allowEmptyFiles}
                      customFieldsUI={customFieldsUI}
                      config={this.config}
                      vocabularies={this.vocabularies}
                      noFiles={this.noFiles}
                      hideCommunitySelection={this.hide_community_selection}
                    />
                  </AccordionField>
                </Overridable>
                <Overridable
                  id="InvenioAppRdm.Deposit.BasicInformation.after.container"
                  record={record}
                  files={files}
                  permissions={permissions}
                  preselectedCommunity={preselectedCommunity}
                  filesLocked={filesLocked}
                  recordRestrictionGracePeriod={recordRestrictionGracePeriod}
                  allowRecordRestriction={allowRecordRestriction}
                  groupsEnabled={groupsEnabled}
                  allowEmptyFiles={allowEmptyFiles}
                  customFieldsUI={customFieldsUI}
                  config={this.config}
                  vocabularies={this.vocabularies}
                  noFiles={this.noFiles}
                  hideCommunitySelection={this.hide_community_selection}
                />
                <Overridable
                  id="InvenioAppRdm.Deposit.AccordionFieldRecommendedInformation.container"
                  vocabularies={this.vocabularies}
                  config={this.config}
                  record={record}
                >
                  <AccordionField
                    includesPaths={
                      this.sectionsConfig["recommended-information-section"]
                    }
                    severityChecks={this.severityChecks}
                    label={i18next.t("Recommended information")}
                    id="recommended-information-section"
                  >
                    <Overridable
                      id="InvenioAppRdm.Deposit.ContributorsField.container"
                      fieldPath="metadata.contributors"
                      vocabularies={this.vocabularies}
                      config={this.config}
                    >
                      <CreatibutorsField
                        addButtonLabel={i18next.t("Add contributor")}
                        label={i18next.t("Contributors")}
                        labelIcon="user plus"
                        fieldPath="metadata.contributors"
                        roleOptions={this.vocabularies.metadata.contributors.role}
                        schema="contributors"
                        autocompleteNames={this.config.autocomplete_names}
                        modal={{
                          addLabel: i18next.t("Add contributor"),
                          editLabel: i18next.t("Edit contributor"),
                        }}
                      />
                    </Overridable>

                    <Overridable
                      id="InvenioAppRdm.Deposit.SubjectsField.container"
                      vocabularies={this.vocabularies}
                      fieldPath="metadata.subjects"
                      record={record}
                    >
                      <SubjectsField
                        fieldPath="metadata.subjects"
                        initialOptions={_get(record, "ui.subjects", null)}
                        limitToOptions={this.vocabularies.metadata.subjects.limit_to}
                        searchOnFocus
                      />
                    </Overridable>

                    <Overridable
                      id="InvenioAppRdm.Deposit.LanguagesField.container"
                      fieldPath="metadata.languages"
                      record={record}
                    >
                      <LanguagesField
                        fieldPath="metadata.languages"
                        initialOptions={_get(record, "ui.languages", []).filter(
                          (lang) => lang !== null
                        )} // needed because dumped empty record from backend gives [null]
                        serializeSuggestions={(suggestions) =>
                          suggestions.map((item) => ({
                            text: item.title_l10n,
                            value: item.id,
                            key: item.id,
                          }))
                        }
                      />
                    </Overridable>

                    <Overridable
                      id="InvenioAppRdm.Deposit.DateField.container"
                      vocabularies={this.vocabularies}
                      fieldPath="metadata.dates"
                    >
                      <DatesField
                        fieldPath="metadata.dates"
                        options={this.vocabularies.metadata.dates}
                        showEmptyValue
                      />
                    </Overridable>

                    <Overridable
                      id="InvenioAppRdm.Deposit.VersionField.container"
                      fieldPath="metadata.version"
                    >
                      <VersionField fieldPath="metadata.version" />
                    </Overridable>

                    <Overridable
                      id="InvenioAppRdm.Deposit.PublisherField.container"
                      fieldPath="metadata.publisher"
                    >
                      <PublisherField fieldPath="metadata.publisher" />
                    </Overridable>
                  </AccordionField>
                </Overridable>
                <Overridable
                  id="InvenioAppRdm.Deposit.AccordionFieldFunding.container"
                  ui={this.accordionStyle}
                >
                  <AccordionField
                    includesPaths={this.sectionsConfig["funding-section"]}
                    severityChecks={this.severityChecks}
                    active
                    label={i18next.t("Funding")}
                    ui={this.accordionStyle}
                    id="funding-section"
                  >
                    <Overridable
                      id="InvenioAppRdm.Deposit.FundingField.container"
                      fieldPath="metadata.funding"
                    >
                      <FundingField
                        fieldPath="metadata.funding"
                        searchConfig={{
                          searchApi: {
                            axios: {
                              headers: {
                                Accept: "application/vnd.inveniordm.v1+json",
                              },
                              url: "/api/awards",
                              withCredentials: false,
                            },
                          },
                          initialQueryState: {
                            sortBy: "bestmatch",
                            sortOrder: "asc",
                            layout: "list",
                            page: 1,
                            size: 5,
                          },
                        }}
                        label={i18next.t("Awards/Grants")}
                        labelIcon="money bill alternate outline"
                        deserializeAward={(award) => {
                          return {
                            title: award.title_l10n,
                            number: award.number,
                            funder: award.funder ?? "",
                            id: award.id,
                            ...(award.identifiers && {
                              identifiers: award.identifiers,
                            }),
                            ...(award.acronym && { acronym: award.acronym }),
                          };
                        }}
                        deserializeFunder={(funder) => {
                          return {
                            id: funder.id,
                            name: funder.name,
                            ...(funder.title_l10n && { title: funder.title_l10n }),
                            ...(funder.pid && { pid: funder.pid }),
                            ...(funder.country && { country: funder.country }),
                            ...(funder.country_name && {
                              country_name: funder.country_name,
                            }),
                            ...(funder.identifiers && {
                              identifiers: funder.identifiers,
                            }),
                          };
                        }}
                        computeFundingContents={(funding) => {
                          let headerContent,
                            descriptionContent,
                            awardOrFunder = "";

                          if (funding.funder) {
                            const funderName =
                              funding.funder?.name ??
                              funding.funder?.title ??
                              funding.funder?.id ??
                              "";
                            awardOrFunder = "funder";
                            headerContent = funderName;
                            descriptionContent = "";

                            // there cannot be an award without a funder
                            if (funding.award) {
                              const { acronym, title } = funding.award;
                              awardOrFunder = "award";
                              descriptionContent = funderName;
                              headerContent = acronym ? `${acronym} — ${title}` : title;
                            }
                          }

                          return { headerContent, descriptionContent, awardOrFunder };
                        }}
                      />
                    </Overridable>
                  </AccordionField>
                </Overridable>
                <Overridable
                  id="InvenioAppRdm.Deposit.AccordionFieldAlternateIdentifiers.container"
                  vocabularies={this.vocabularies}
                >
                  <AccordionField
                    includesPaths={this.sectionsConfig["alternate-identifiers-section"]}
                    severityChecks={this.severityChecks}
                    active
                    label={i18next.t("Alternate identifiers")}
                    id="alternate-identifiers-section"
                  >
                    <Overridable
                      id="InvenioAppRdm.Deposit.IdentifiersField.container"
                      vocabularies={this.vocabularies}
                      fieldPath="metadata.identifiers"
                    >
                      <IdentifiersField
                        fieldPath="metadata.identifiers"
                        label={i18next.t("Alternate identifiers")}
                        labelIcon="barcode"
                        schemeOptions={this.vocabularies.metadata.identifiers.scheme}
                        showEmptyValue
                      />
                    </Overridable>
                  </AccordionField>
                </Overridable>

                <Overridable
                  id="InvenioAppRdm.Deposit.AccordionFieldRelatedWorks.container"
                  vocabularies={this.vocabularies}
                >
                  <AccordionField
                    includesPaths={this.sectionsConfig["related-works-section"]}
                    severityChecks={this.severityChecks}
                    active
                    label={i18next.t("Related works")}
                    id="related-works-section"
                  >
                    <Overridable
                      id="InvenioAppRdm.Deposit.RelatedWorksField.container"
                      fieldPath="metadata.related_identifiers"
                      vocabularies={this.vocabularies}
                    >
                      <RelatedWorksField
                        fieldPath="metadata.related_identifiers"
                        options={this.vocabularies.metadata.identifiers}
                        showEmptyValue
                      />
                    </Overridable>
                  </AccordionField>
                </Overridable>
                <Overridable
                  id="InvenioAppRdm.Deposit.AccordionFieldReferences.container"
                  vocabularies={this.vocabularies}
                >
                  <AccordionField
                    includesPaths={this.sectionsConfig["references-section"]}
                    severityChecks={this.severityChecks}
                    active
                    label={i18next.t("References")}
                    id="references-section"
                  >
                    <Overridable
                      id="InvenioAppRdm.Deposit.ReferencesField.container"
                      fieldPath="metadata.references"
                      vocabularies={this.vocabularies}
                    >
                      <ReferencesField fieldPath="metadata.references" showEmptyValue />
                    </Overridable>
                  </AccordionField>
                </Overridable>
                {!_isEmpty(customFieldsUI) && (
                  <Overridable
                    id="InvenioAppRdm.Deposit.CustomFields.container"
                    record={record}
                    customFieldsUI={customFieldsUI}
                  >
                    <CustomFields
                      config={customFieldsUI}
                      record={record}
                      templateLoaders={[
                        (widget) => import(`@templates/custom_fields/${widget}.js`),
                        (widget) =>
                          import(`@js/invenio_rdm_records/src/deposit/customFields`),
                        (widget) => import(`react-invenio-forms`),
                      ]}
                      fieldPathPrefix="custom_fields"
                      severityChecks={this.severityChecks}
                    />
                  </Overridable>
                )}
              </Grid.Column>
              <Ref innerRef={this.sidebarRef}>
                <Grid.Column
                  mobile={16}
                  tablet={16}
                  computer={5}
                  className="deposit-sidebar"
                >
                  <Sticky context={this.sidebarRef} offset={20}>
                    <Overridable
                      id="InvenioAppRdm.Deposit.CardDepositStatusBox.container"
                      record={record}
                      permissions={permissions}
                      groupsEnabled={groupsEnabled}
                    >
                      <Card>
                        <Card.Content>
                          <DepositStatusBox />
                        </Card.Content>
                        <Card.Content>
                          <Grid relaxed>
                            <Grid.Column
                              computer={8}
                              mobile={16}
                              className="pb-0 left-btn-col"
                            >
                              <SaveButton fluid />
                            </Grid.Column>

                            <Grid.Column
                              computer={8}
                              mobile={16}
                              className="pb-0 right-btn-col"
                            >
                              <PreviewButton fluid />
                            </Grid.Column>

                            <Grid.Column width={16} className="pt-10">
                              <PublishButton fluid record={record} />
                            </Grid.Column>

                            <Grid.Column width={16} className="pt-0">
                              {(record.is_draft === null || permissions.can_manage) && (
                                <ShareDraftButton
                                  record={record}
                                  permissions={permissions}
                                  groupsEnabled={groupsEnabled}
                                />
                              )}
                            </Grid.Column>
                          </Grid>
                        </Card.Content>
                      </Card>
                    </Overridable>
                    <Overridable
                      id="InvenioAppRdm.Deposit.AccessRightField.container"
                      fieldPath="access"
                      record={record}
                      permissions={permissions}
                      recordRestrictionGracePeriod={recordRestrictionGracePeriod}
                      allowRecordRestriction={allowRecordRestriction}
                    >
                      <AccessRightField
                        label={i18next.t("Visibility")}
                        record={record}
                        labelIcon="shield"
                        fieldPath="access"
                        showMetadataAccess={permissions?.can_manage_record_access}
                        recordRestrictionGracePeriod={recordRestrictionGracePeriod}
                        allowRecordRestriction={allowRecordRestriction}
                        id="visibility-section"
                      />
                    </Overridable>
                    {permissions?.can_delete_draft && (
                      <Overridable
                        id="InvenioAppRdm.Deposit.CardDeleteButton.container"
                        record={record}
                      >
                        <Card>
                          <Card.Content>
                            <DeleteButton fluid />
                          </Card.Content>
                        </Card>
                      </Overridable>
                    )}
                  </Sticky>
                </Grid.Column>
              </Ref>
            </Grid>
          </Container>
        </DepositFormApp>
      </Overridable>
    );
  }
}

RDMDepositForm.propTypes = {
  groupsEnabled: PropTypes.bool.isRequired,
  config: PropTypes.object.isRequired,
  recordRestrictionGracePeriod: PropTypes.number.isRequired,
  allowRecordRestriction: PropTypes.bool.isRequired,
  record: PropTypes.object.isRequired,
  preselectedCommunity: PropTypes.object,
  files: PropTypes.object,
  permissions: PropTypes.object,
  filesLocked: PropTypes.bool,
  allowEmptyFiles: PropTypes.bool,
  useUppy: PropTypes.bool,
};

RDMDepositForm.defaultProps = {
  preselectedCommunity: undefined,
  permissions: null,
  files: null,
  filesLocked: false,
  allowEmptyFiles: true,
};

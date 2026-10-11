(function () {
  if (!window.CMS || !window.createClass || !window.h) {
    throw new Error('Decap CMS custom widget APIs were not available.');
  }

  const h = window.h;
  const createClass = window.createClass;

  function toPlainValue(value) {
    return value && typeof value.toJS === 'function' ? value.toJS() : value;
  }

  function readList(value) {
    const plainValue = toPlainValue(value);
    return Array.isArray(plainValue) ? plainValue : [];
  }

  function readFields(field) {
    const configuredFields = field && typeof field.get === 'function'
      ? field.get('fields')
      : [];
    const plainFields = toPlainValue(configuredFields);
    return Array.isArray(plainFields) ? plainFields : [];
  }

  function getDisplayTitle(item, fields, index) {
    const preferredNames = ['title', 'name', 'question', 'caption'];
    for (const name of preferredNames) {
      if (item && typeof item[name] === 'string' && item[name].trim()) {
        return item[name];
      }
    }
    const firstField = fields[0];
    const firstValue = firstField && item ? item[firstField.name] : '';
    return typeof firstValue === 'string' && firstValue.trim()
      ? firstValue
      : `Content item ${index + 1}`;
  }

  const VisualListControl = createClass({
    handleFieldChange: function (itemIndex, fieldName, value) {
      const items = readList(this.props.value).map(function (item) {
        return item && typeof item === 'object' ? Object.assign({}, item) : item;
      });
      items[itemIndex] = Object.assign({}, items[itemIndex], { [fieldName]: value });
      this.props.onChange(items);
    },

    moveItem: function (fromIndex, toIndex) {
      const items = readList(this.props.value).slice();
      if (toIndex < 0 || toIndex >= items.length) return;
      const movedItem = items.splice(fromIndex, 1)[0];
      items.splice(toIndex, 0, movedItem);
      this.props.onChange(items);
    },

    duplicateItem: function (index) {
      const items = readList(this.props.value).slice();
      const copy = JSON.parse(JSON.stringify(items[index]));
      items.splice(index + 1, 0, copy);
      this.props.onChange(items);
    },

    handleDragStart: function (event, index) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    },

    handleDrop: function (event, toIndex) {
      event.preventDefault();
      const fromIndex = Number(event.dataTransfer.getData('text/plain'));
      if (Number.isInteger(fromIndex) && fromIndex !== toIndex) {
        this.moveItem(fromIndex, toIndex);
      }
    },

    renderField: function (item, itemIndex, field) {
      const fieldName = field.name;
      const fieldLabel = field.label || fieldName;
      const value = item && item[fieldName] != null ? item[fieldName] : '';
      const inputId = `${this.props.forID}-${itemIndex}-${fieldName}`;
      const isMultiline = field.widget === 'text' || field.widget === 'markdown';
      const options = Array.isArray(field.options) ? field.options : [];
      const minimum = field.min;
      const maximum = field.max;
      const input = field.widget === 'select'
        ? h('select', {
          id: inputId,
          className: 'visual-list-input',
          value: value,
          required: field.required !== false,
          onChange: event => this.handleFieldChange(itemIndex, fieldName, event.target.value)
        },
        options.map(option => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          return h('option', { value: optionValue, key: optionValue }, optionLabel);
        }))
        : h(isMultiline ? 'textarea' : 'input', {
          id: inputId,
          className: 'visual-list-input',
          value: value,
          required: field.required !== false,
          type: field.widget === 'number' ? 'number' : 'text',
          min: minimum,
          max: maximum,
          placeholder: field.widget === 'image' ? 'Image URL or /images/filename.jpg' : undefined,
          rows: isMultiline ? 3 : undefined,
          onChange: event => this.handleFieldChange(
            itemIndex,
            fieldName,
            field.widget === 'number' ? Number(event.target.value) : event.target.value
          )
        });
      return h('label', { className: 'visual-list-field', key: fieldName },
        h('span', {}, fieldLabel),
        input,
        field.widget === 'image' && value
          ? h('img', { className: 'visual-list-image-preview', src: value, alt: item.alt || '', loading: 'lazy' })
          : null,
        field.widget === 'image'
          ? h('small', {}, 'Use the public image URL or a path such as /images/photo.jpg.')
          : null,
        field.widget === 'number' && maximum != null
          ? h('small', {}, `Choose a value from ${minimum == null ? 'any' : minimum} to ${maximum}.`)
          : null
      );
    },

    renderItem: function (item, index, items, fields) {
      const record = item && typeof item === 'object' ? item : {};
      const image = typeof record.image === 'string' ? record.image : '';
      const icon = typeof record.icon === 'string' ? record.icon : '';
      const description = record.description || record.answer || record.quote || '';
      const title = getDisplayTitle(record, fields, index);

      return h('article', {
        className: 'visual-list-card',
        key: `${index}-${title}`,
        onDragOver: event => event.preventDefault(),
        onDrop: event => this.handleDrop(event, index)
      },
        h('div', {
          className: 'visual-list-card-preview',
          draggable: true,
          onDragStart: event => this.handleDragStart(event, index),
          title: 'Drag to change this item’s position'
        },
          h('span', { className: 'visual-list-drag-handle', 'aria-hidden': 'true' }, '⠿'),
          icon && h('i', { className: `visual-list-icon-preview ${icon}` }),
          image && h('img', { src: image, alt: record.alt || '', loading: 'lazy' }),
          h('strong', {}, title),
          description && h('p', {}, description)
        ),
        h('div', { className: 'visual-list-card-fields' },
          fields.map(field => this.renderField(record, index, field))
        ),
        h('div', { className: 'visual-list-card-actions' },
          h('button', {
            type: 'button',
            disabled: index === 0,
            onClick: () => this.moveItem(index, index - 1),
            'aria-label': `Move ${title} up`
          }, 'Move up'),
          h('button', {
            type: 'button',
            disabled: index === items.length - 1,
            onClick: () => this.moveItem(index, index + 1),
            'aria-label': `Move ${title} down`
          }, 'Move down'),
          h('button', {
            type: 'button',
            onClick: () => this.duplicateItem(index),
            'aria-label': `Duplicate ${title}`
          }, 'Duplicate'),
          h('button', {
            type: 'button',
            className: 'visual-list-remove',
            onClick: () => this.props.onChange(items.filter((_, itemIndex) => itemIndex !== index)),
            'aria-label': `Remove ${title}`
          }, 'Remove')
        )
      );
    },

    render: function () {
      const items = readList(this.props.value);
      const fields = readFields(this.props.field);
      return h('section', { className: 'visual-list-widget' },
        h('p', { className: 'visual-list-help' },
          'Edit these content cards below. Drag a card preview or use the move buttons to reorder it.'
        ),
        items.length
          ? h('div', { className: 'visual-list-grid' },
            items.map((item, index) => this.renderItem(item, index, items, fields))
          )
          : h('p', { className: 'visual-list-empty' }, 'No items yet. Add an item to begin.'),
        h('button', {
          type: 'button',
          className: 'visual-list-add',
          onClick: () => {
            const emptyItem = fields.reduce((item, field) => {
              item[field.name] = field.widget === 'number'
                ? (field.min == null ? 1 : field.min)
                : field.widget === 'select' && field.options && field.options.length
                  ? (typeof field.options[0] === 'object' ? field.options[0].value : field.options[0])
                  : '';
              return item;
            }, {});
            this.props.onChange(items.concat(emptyItem));
          }
        }, 'Add content item')
      );
    }
  });

  function getEntryData(entry) {
    const data = entry && entry.getIn ? entry.getIn(['data']) : null;
    return toPlainValue(data) || {};
  }

  function text(value, fallback) {
    return typeof value === 'string' && value ? value : fallback;
  }

  function previewTopBar(data) {
    return h('div', { className: 'top-bar' },
      h('div', { className: 'top-bar-container' },
          h('div', { className: 'top-bar-left' },
            h('span', { className: 'top-bar-item' },
              h('i', { className: 'fas fa-map-marker-alt' }),
              ` ${text(data.address, '6 Red Soil St, Nairobi')}`
            ),
            h('span', { className: 'top-bar-item' },
              h('i', { className: 'fas fa-phone' }),
              ` ${text(data.phone, '+254 748 662082')}`
            ),
            h('span', { className: 'top-bar-item' },
              h('i', { className: 'fas fa-envelope' }),
              ` ${text(data.email, 'mwikimodern@gmail.com')}`
            ),
            h('span', { className: 'top-bar-item highlight-badge' },
              h('i', { className: 'fas fa-clock' }),
              ` ${text(data.opening_hours, 'Open 24 Hours Everyday')}`
            )
          )
      )
    );
  }

  function previewNavigation(data) {
    return h('nav', { className: 'navbar' },
      h('div', { className: 'nav-container' },
          h('div', { className: 'nav-logo' },
            h('img', { src: '/images/favicon.png', alt: '', className: 'logo-img' }),
            h('h2', { className: 'logo-text' }, text(data.name, 'MWIKI MODERN MEDICAL CENTRE'))
          ),
          h('div', { className: 'preview-nav-links' },
            ['Home', 'Services', 'Departments', 'About', 'Contact'].map(label =>
              h('span', { key: label }, label)
            )
          )
      )
    );
  }

  function previewPageHeading(title, subtitle) {
    return h('div', { className: 'page-header' },
      h('h1', { className: 'glass-heading' }, title),
      subtitle && h('p', {}, subtitle)
    );
  }

  function previewCardGrid(items, titleKey, descriptionKey, iconClass, cardClass) {
    if (!Array.isArray(items)) return null;
    return h('div', { className: 'elementor-row' },
      items.map((item, index) => h('article', { className: cardClass, key: index },
          item && item[iconClass] && h('i', { className: item[iconClass] }),
          h(cardClass === 'service-card' ? 'h2' : 'h3', {}, text(item && item[titleKey], `Item ${index + 1}`)),
          item && item[descriptionKey] && h('p', {}, item[descriptionKey])
      ))
    );
  }

  function previewFooter(data) {
    return h('footer', { className: 'footer' },
      h('div', { className: 'footer-content' },
        h('div', { className: 'footer-section footer-brand' },
          h('div', { className: 'footer-brand-inner' },
            h('img', { src: '/images/favicon.png', alt: '', className: 'footer-logo' }),
            h('h4', {}, text(data.name, 'MWIKI MODERN MEDICAL CENTRE'))
          ),
          h('p', {}, text(data.footer_blurb, 'Providing quality healthcare services to the community.'))
        ),
        h('div', { className: 'footer-section' },
          h('h4', {}, 'Quick Links'),
          h('ul', {}, ['Home', 'Services', 'Departments', 'About', 'Contact'].map(label =>
            h('li', { key: label }, h('span', {}, label))
          ))
        ),
        h('div', { className: 'footer-section' },
          h('h4', {}, 'Contact Info'),
          h('p', {}, text(data.address, '6 Red Soil St, Nairobi')),
          h('p', {}, text(data.phone, '+254 748 662082')),
          h('p', {}, text(data.email, 'mwikimodern@gmail.com'))
        )
      )
    );
  }

  function createPagePreview(pageName) {
    return createClass({
      render: function () {
          const data = getEntryData(this.props.entry);
          const title = text(data.page_title || data.hero_title || data.name, 'MWIKI Modern Medical Centre');
          const subtitle = text(data.page_subtitle || data.hero_subtitle || data.footer_blurb, '');
          const siteData = pageName === 'site' ? data : {};
          let content;

          if (pageName === 'home') {
            content = h('main', {},
              h('section', { className: 'hero-video-section preview-home-hero' },
                h('div', { className: 'video-bg-wrapper' },
                  h('img', { src: '/images/hero-fallback.jpeg', alt: '', className: 'hero-media-element' }),
                  h('div', { className: 'hero-dark-overlay' })
                ),
                h('div', { className: 'hero-video-content' },
                  h('div', { className: 'hero-heading-box' }, h('h1', {}, text(data.hero_title, ''))),
                  h('p', { className: 'hero-subtitle' }, text(data.hero_subtitle, '')),
                  h('span', { className: 'schedule-cta-btn' }, text(data.cta_text, 'Schedule Your Appointment'))
                )
              ),
              h('section', { className: 'slideshow-section' },
                h('div', { className: 'slideshow-container' },
                  (Array.isArray(data.slides) ? data.slides : []).map((slide, index) =>
                    h('div', { className: `slide${index === 0 ? ' fade' : ''}`, key: index },
                      slide.image && h('img', { src: slide.image, alt: slide.alt || '' }),
                      h('div', { className: 'slide-text' }, h('h1', {}, slide.title || ''))
                    )
                  )
                )
              ),
              h('div', { className: 'sticky-container' },
                h('section', { className: 'sticky-section faq-section' },
                  h('h2', { className: 'glass-heading-h2' }, text(data.faq_title, 'Frequently Asked Questions')),
                  h('div', { className: 'faq-content' },
                    (Array.isArray(data.faqs) ? data.faqs : []).map((faq, index) =>
                      h('article', { className: 'faq-item active', key: index },
                        h('div', { className: 'faq-toggle' },
                          text(faq.question, ''),
                          h('span', { className: 'toggle-icon' }, '+')
                        ),
                        h('div', { className: 'faq-answer' }, h('p', {}, text(faq.answer, '')))
                      )
                    )
                  )
                ),
                h('section', { className: 'sticky-section reviews-section' },
                  h('h2', { className: 'glass-heading-h2' }, text(data.reviews_title, 'Patient Reviews')),
                  h('div', { className: 'reviews-content' },
                    (Array.isArray(data.testimonials) ? data.testimonials : []).map((review, index) =>
                      h('article', { className: 'review-item', key: index },
                        h('div', { className: 'review-header' },
                          h('span', { className: 'review-stars' }, '★'.repeat(Math.max(0, Number(review.rating) || 0))),
                          h('span', { className: 'review-author' }, text(review.name, 'Patient'))
                        ),
                        h('p', { className: 'review-text' }, text(review.quote, ''))
                      )
                    )
                  )
                )
              )
            );
          } else if (pageName === 'services') {
            content = h('main', {},
              previewPageHeading(title, subtitle),
              h('section', { className: 'services-grid' },
                (Array.isArray(data.items) ? data.items : []).map((item, index) =>
                  h('article', { className: 'service-card', key: index },
                    h('i', { className: item.icon || 'fas fa-stethoscope' }),
                    h('h2', { className: 'glass-heading-h2' }, text(item.title, '')),
                    h('p', {}, text(item.description, '')),
                    h('span', { className: 'book-btn' }, 'Learn More')
                  )
                )
              ),
              h('section', { className: 'cta-section' },
                h('h2', { className: 'glass-heading' }, text(data.cta_title, '')),
                h('p', {}, text(data.cta_text, '')),
                h('span', { className: 'appointment-btn' }, 'Contact Us Now')
              )
            );
          } else if (pageName === 'departments') {
            content = h('main', { className: 'departments-section' },
              previewPageHeading(title, subtitle),
              h('section', { className: 'services-grid' },
                (Array.isArray(data.items) ? data.items : []).map((item, index) =>
                  h('article', { className: 'service-card', key: index },
                    h('i', { className: item.icon || 'fas fa-hospital' }),
                    h('h3', {}, text(item.title, '')),
                    h('p', {}, text(item.description, ''))
                  )
                )
              )
            );
          } else if (pageName === 'about') {
            content = h('main', {},
              previewPageHeading(title, subtitle),
              h('section', { className: 'elementor-section elementor-about' },
                h('div', { className: 'elementor-container' },
                  h('div', { className: 'elementor-row preview-about-intro' },
                    h('div', { className: 'elementor-column' },
                      h('h2', { className: 'elementor-heading-secondary' }, text(data.intro_heading, '')),
                      (Array.isArray(data.intro_paragraphs) ? data.intro_paragraphs : []).map((paragraph, index) =>
                        h('p', { key: index }, paragraph)
                      )
                    ),
                    h('div', { className: 'elementor-column' },
                      h('img', { className: 'elementor-image preview-about-image', src: '/images/hero-fallback.jpeg', alt: 'MWIKI Modern Medical Centre' })
                    )
                  )
                )
              ),
              h('section', { className: 'elementor-section elementor-mvv' },
                h('div', { className: 'elementor-container' },
                  h('div', { className: 'elementor-row' },
                    [
                      ['fas fa-bullseye', 'Our Mission', data.mission],
                      ['fas fa-eye', 'Our Vision', data.vision],
                      ['fas fa-heart', 'Our Values', data.values]
                    ].map(([icon, label, value]) => h('article', { className: 'elementor-card', key: label },
                      h('i', { className: icon }),
                      h('h3', {}, label),
                      h('p', { className: label === 'Our Values' ? 'preview-values' : '' }, text(value, ''))
                    ))
                  )
                )
              ),
              h('section', { className: 'elementor-section elementor-features' },
                h('div', { className: 'elementor-container' },
                  h('h2', { className: 'elementor-heading-secondary' }, text(data.features_title, 'Why Choose Us')),
                  previewCardGrid(data.features, 'title', 'description', 'icon', 'elementor-feature')
                )
              ),
              h('section', { className: 'elementor-section elementor-team' },
                h('div', { className: 'elementor-container' },
                  h('h2', { className: 'elementor-heading-secondary' }, text(data.team_title, 'Our Team')),
                  h('p', { className: 'elementor-subtitle' }, text(data.team_subtitle, '')),
                  h('div', { className: 'elementor-row' },
                    (Array.isArray(data.team) ? data.team : []).map((member, index) =>
                      h('article', { className: 'elementor-team-member', key: index },
                        h('div', { className: 'member-avatar' }, h('i', { className: member.icon || 'fas fa-user' })),
                        h('h4', {}, text(member.name, '')),
                        h('p', { className: 'member-title' }, text(member.title, '')),
                        h('p', { className: 'member-bio' }, text(member.bio, ''))
                      )
                    )
                  )
                )
              ),
              h('section', { className: 'elementor-cta' },
                h('div', { className: 'elementor-container' },
                  h('h2', {}, text(data.cta_title, '')),
                  h('p', {}, text(data.cta_text, '')),
                  h('span', { className: 'appointment-btn' }, 'Contact Us')
                )
              )
            );
          } else if (pageName === 'contact') {
            content = h('main', {},
              h('section', { className: 'contact-info-section' },
                h('h2', { className: 'glass-heading' }, text(data.contact_title, 'Get In Touch')),
                h('div', { className: 'contact-grid' },
                  (Array.isArray(data.contact_cards) ? data.contact_cards : []).map((item, index) =>
                    h('article', { className: 'contact-card', key: index },
                      h('i', { className: item.icon || 'fas fa-address-card' }),
                      h('h3', {}, text(item.title, '')),
                      h('p', {}, item.href
                        ? h('span', { className: 'preview-link-text' }, text(item.detail, ''))
                        : text(item.detail, '')
                      ),
                      h('p', { className: 'contact-desc' }, text(item.description, ''))
                    )
                  )
                )
              ),
              h('section', { className: 'contact-form-section' },
                h('h2', { className: 'glass-heading-h2' }, text(data.form_title, 'Send Us a Message')),
                h('form', { className: 'contact-form' },
                  [
                    ['Full Name', 'text'],
                    ['Email Address', 'email'],
                    ['Phone Number', 'tel'],
                    ['Subject', 'text']
                  ].map(([label, type]) => h('div', { className: 'form-group', key: label },
                    h('label', {}, label),
                    h('input', { type: type, disabled: true })
                  )),
                  h('div', { className: 'form-group' },
                    h('label', {}, 'Message'),
                    h('textarea', { rows: 4, disabled: true })
                  ),
                  h('button', { type: 'button', className: 'submit-btn' }, text(data.submit_text, 'Send Message'))
                )
              ),
              h('section', { className: 'appointment-section' },
                h('h2', { className: 'glass-heading' }, text(data.appointment_title, 'Book An Appointment')),
                h('p', {}, text(data.appointment_text, '')),
                h('div', { className: 'appointment-methods' },
                  (Array.isArray(data.appointment_methods) ? data.appointment_methods : []).map((method, index) =>
                    h('article', { className: 'method', key: index },
                      h('i', { className: method.icon || 'fas fa-calendar-check' }),
                      h('h3', {}, text(method.title, '')),
                      h('p', {}, text(method.description, '')),
                      h('span', { className: 'method-btn' }, text(method.button_text, 'Contact'))
                    )
                  )
                )
              ),
              h('section', { className: 'map-section' },
                h('h2', { className: 'glass-heading-h2' }, text(data.map_title, 'Find Us')),
                h('p', {}, text(data.map_text, '')),
                h('div', { className: 'map-container preview-map-container' },
                  h('iframe', {
                    src: data.map_embed_url,
                    title: 'Map showing MWIKI Modern Medical Centre',
                    loading: 'lazy',
                    referrerPolicy: 'no-referrer-when-downgrade'
                  })
                )
              )
            );
          } else {
            content = h('main', {},
              previewPageHeading('Contact & Branding', 'These details appear across the live site.'),
              h('section', { className: 'quick-info preview-site-info' },
                [
                  ['fas fa-phone', 'Phone', data.phone],
                  ['fas fa-envelope', 'Email', data.email],
                  ['fas fa-map-marker-alt', 'Address', data.address],
                  ['fas fa-clock', 'Opening Hours', data.opening_hours]
                ].map(([icon, label, value]) => h('article', { className: 'info-card', key: label },
                  h('i', { className: icon }),
                  h('h3', {}, label),
                  h('p', {}, text(value, ''))
                ))
              ),
              h('footer', { className: 'footer preview-site-footer' },
                h('div', { className: 'footer-content' },
                  h('div', { className: 'footer-section' },
                    h('h4', {}, text(data.name, 'MWIKI MODERN MEDICAL CENTRE')),
                    h('p', {}, text(data.footer_blurb, ''))
                  )
                )
              )
            );
          }

          return h('div', { className: 'editable-site-preview' },
            previewTopBar(siteData),
            previewNavigation(siteData),
            content,
            previewFooter(siteData),
            h('a', { className: 'whatsapp-btn preview-whatsapp', 'aria-label': 'WhatsApp contact' },
              h('i', { className: 'fab fa-whatsapp' })
            )
          );
      }
    });
  }

  window.CMS.registerWidget('visual-list', VisualListControl);
  window.CMS.registerPreviewStyle('/style.css');
  window.CMS.registerPreviewStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
  window.CMS.registerPreviewStyle('/admin/preview.css');
  window.CMS.registerPreviewTemplate('site', createPagePreview('site'));
  window.CMS.registerPreviewTemplate('home', createPagePreview('home'));
  window.CMS.registerPreviewTemplate('services', createPagePreview('services'));
  window.CMS.registerPreviewTemplate('departments', createPagePreview('departments'));
  window.CMS.registerPreviewTemplate('about', createPagePreview('about'));
  window.CMS.registerPreviewTemplate('contact', createPagePreview('contact'));
})();

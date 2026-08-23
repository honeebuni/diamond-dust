module Jekyll

  class ContentBlock < Liquid::Block

    def initialize(tag_name, block_options, tokens)
      @block_name = block_options.strip
      super
    end

    def render(context)

      content = super

      case @block_name

      when "excerpt"
        %(<div class="novel-excerpt">#{content}</div>)

      when "glossary"
        %(<div class="glossary-entry">#{content}</div>)

      when "journal"
        %(<div class="journal-entry">#{content}</div>)

      when "sticky-note"
        %(<div class="sticky-note">#{content}</div>)

      when "translator-note"
        %(
          <div class="translator-note">
            <span class="translator-note-label">
              Translator's Note
            </span>
            #{content}
          </div>
        )

      when "scene-break"
        %(
          <div class="scene-break" aria-hidden="true">
            ✦
          </div>
        )

      when "end-note"
        %(<div class="end-note">#{content}</div>)

      else
        content

      end

    end

  end


  Liquid::Template.register_tag(
    "content",
    ContentBlock
  )

end

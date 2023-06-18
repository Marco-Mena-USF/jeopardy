$(document).ready(function() {
    const API_URL = 'http://jservice.io/api/';
    const NUM_CATEGORIES = 6;
    const NUM_QUESTIONS_PER_CAT = 2;
    const POINTS = [100, 200, 300, 400, 500, 600];
    let categories = [];
  
    function getCategoryIds() {
      return $.ajax({
        url: `${API_URL}categories?count=${NUM_CATEGORIES}`,
        method: 'GET',
      }).then(function(response) {
        return response.map(function(category) {
          return category.id;
        });
      });
    }
  
    function getCategory(catId) {
      return $.ajax({
        url: `${API_URL}category?id=${catId}`,
        method: 'GET',
      }).then(function(response) {
        return {
          title: response.title,
          clues: response.clues.slice(0, NUM_QUESTIONS_PER_CAT).map(function(clue, index) {
            return {
              question: clue.question,
              answer: clue.answer,
              points: POINTS[index],
              showing: null
            };
          }),
        };
      });
    }
  
    function fillTable() {
      const jeopardyTable = $('#jeopardy');
  
      jeopardyTable.empty();
  
      // Create table headers
      const headerRow = $('<tr>');
      categories.forEach(function(category) {
        const headerCell = $('<th>').text(category.title);
        headerRow.append(headerCell);
      });
      jeopardyTable.append(headerRow);
  
      // Create table cells for clues
      for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
        const questionRow = $('<tr>');
  
        categories.forEach(function(category) {
          const clue = category.clues[i];
          const questionCell = $('<td>')
            .addClass('question-cell')
            .attr('data-category-index', categories.indexOf(category))
            .attr('data-clue-index', i)
            .html(`<span class="points">${clue.points}</span>?`);
          questionRow.append(questionCell);
        });
  
        jeopardyTable.append(questionRow);
      }
    }
  
    function handleClick(evt) {
      const questionCell = $(evt.target);
      const categoryIndex = parseInt(questionCell.attr('data-category-index'));
      const clueIndex = parseInt(questionCell.attr('data-clue-index'));
      const clue = categories[categoryIndex].clues[clueIndex];
  
      if (!clue.showing) {
        // Show question
        clue.showing = 'question';
        questionCell.addClass('show-question');
        questionCell.html(`<span class="points">${clue.points}</span>${clue.question}`);
      } else if (clue.showing === 'question') {
        // Show answer
        clue.showing = 'answer';
        questionCell.removeClass('show-question');
        questionCell.addClass('show-answer');
        questionCell.html(`<span class="points">${clue.points}</span>${clue.answer}`);
      }
    }
  
    function showLoadingView() {
      $('#start').prop('disabled', true).text('Loading...');
      $('#spin-container').show();
      $('#jeopardy').empty();
    }
  
    function hideLoadingView() {
      $('#start').prop('disabled', false).text('Restart Game');
      $('#spin-container').hide();
    }
  
    async function setupAndStart() {
      showLoadingView();
  
      const categoryIds = await getCategoryIds();
      categories = await Promise.all(categoryIds.map(getCategory));
  
      fillTable();
      hideLoadingView();
    }
  
    $('#start').click(setupAndStart);
  
    $(document).on('click', '.question-cell', handleClick);
});